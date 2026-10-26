"""Create the initial ADMIN user from environment variables.

A fresh database has no users, and there is no public registration endpoint - creating a
user requires an existing admin - so there would otherwise be no way to log in. Setting
ADMIN_EMAIL and ADMIN_PASSWORD makes the backend create that admin on startup.

Idempotent: if a user with ADMIN_EMAIL already exists it is left untouched, so changing
the password here after the first run has no effect (use the app instead).

Safe to run concurrently. The backend serves with ``uvicorn --workers 2``, so every
worker process runs this at import of main.py, racing the others against an empty
database on first boot.
"""
import logging
import os
import uuid

from sqlalchemy.exc import IntegrityError

from .auth import get_password_hash
from .database import SessionLocal
from .models import AppUser, UserRoleEnum

logger = logging.getLogger(__name__)


def bootstrap_admin():
    """Create the admin from ADMIN_EMAIL/ADMIN_PASSWORD. No-op if either is unset."""
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")

    if not email or not password:
        return None

    db = SessionLocal()
    try:
        if db.query(AppUser).filter(AppUser.email == email).first():
            return None

        # Keep the id rather than reading admin.id back after the commit:
        # expire_on_commit is on, so that would cost another SELECT.
        admin_id = str(uuid.uuid4())
        admin = AppUser(
            id=admin_id,
            name=os.environ.get("ADMIN_NAME", "Admin"),
            email=email,
            hashed_password=get_password_hash(password),
            role=UserRoleEnum.ADMIN,
            is_admin=True,
            is_active=True,
            is_verified=True
        )
        db.add(admin)
        try:
            db.commit()
        except IntegrityError:
            # Another worker committed the same admin between the check above
            # and this commit - a wide window, since it spans the bcrypt hash.
            # AppUser.email is unique, so the database rejected the duplicate.
            # That is the outcome we wanted, so losing the race is not an
            # error: raising here would run at import of main.py and kill the
            # worker before it could serve a request.
            db.rollback()
            if db.query(AppUser).filter(AppUser.email == email).first():
                logger.info(
                    "Initial admin %s was created by another worker", email
                )
                return None
            # The admin still is not there, so the constraint that failed was
            # not the one we are tolerating. Let it surface.
            raise

        logger.info("Created initial admin user: %s", email)
        return admin_id
    finally:
        db.close()


if __name__ == "__main__":
    bootstrap_admin()
