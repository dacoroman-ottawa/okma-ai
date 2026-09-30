"""Create the initial ADMIN user from environment variables.

A fresh database has no users, and there is no public registration endpoint - creating a
user requires an existing admin - so there would otherwise be no way to log in. Setting
ADMIN_EMAIL and ADMIN_PASSWORD makes the backend create that admin on startup.

Idempotent: if a user with ADMIN_EMAIL already exists it is left untouched, so changing
the password here after the first run has no effect (use the app instead).
"""
import os
import uuid

from .auth import get_password_hash
from .database import SessionLocal
from .models import AppUser, UserRoleEnum


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

        admin = AppUser(
            id=str(uuid.uuid4()),
            name=os.environ.get("ADMIN_NAME", "Admin"),
            email=email,
            hashed_password=get_password_hash(password),
            role=UserRoleEnum.ADMIN,
            is_admin=True,
            is_active=True,
            is_verified=True
        )
        db.add(admin)
        db.commit()
        print(f"Created initial admin user: {email}")
        return admin.id
    finally:
        db.close()


if __name__ == "__main__":
    bootstrap_admin()
