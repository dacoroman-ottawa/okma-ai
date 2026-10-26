"""Tests for the startup admin bootstrap.

The backend runs with ``uvicorn --workers 2``, so every worker process runs
``backend/main.py``'s module body - including ``bootstrap_admin()``. These
tests cover the resulting concurrency, which the single-process happy path
hides.
"""
import threading

import pytest
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch

from backend.bootstrap_admin import bootstrap_admin
from backend.models import AppUser, Base, UserRoleEnum

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_bootstrap.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

ADMIN_EMAIL = "admin@bootstrap.test"


@pytest.fixture(autouse=True)
def fresh_db(monkeypatch):
    """A clean database, with the module's SessionLocal pointed at it.

    bootstrap_admin binds SessionLocal at import, so patching the attribute on
    the module is what actually redirects it.
    """
    Base.metadata.create_all(bind=engine)
    monkeypatch.setattr(
        "backend.bootstrap_admin.SessionLocal", TestingSessionLocal
    )
    monkeypatch.setenv("ADMIN_EMAIL", ADMIN_EMAIL)
    monkeypatch.setenv("ADMIN_PASSWORD", "s3cret")
    yield
    Base.metadata.drop_all(bind=engine)


def admin_rows():
    db = TestingSessionLocal()
    try:
        return db.query(AppUser).filter(AppUser.email == ADMIN_EMAIL).all()
    finally:
        db.close()


class TestBootstrapBasics:
    def test_creates_the_admin_when_absent(self):
        admin_id = bootstrap_admin()

        assert admin_id is not None
        rows = admin_rows()
        assert len(rows) == 1
        assert rows[0].role == UserRoleEnum.ADMIN
        assert rows[0].is_admin is True

    def test_is_a_noop_without_credentials(self, monkeypatch):
        monkeypatch.delenv("ADMIN_PASSWORD")

        assert bootstrap_admin() is None
        assert admin_rows() == []

    def test_existing_admin_is_left_untouched(self):
        bootstrap_admin()
        original = admin_rows()[0].hashed_password

        assert bootstrap_admin() is None
        rows = admin_rows()
        assert len(rows) == 1
        assert rows[0].hashed_password == original


class TestConcurrentWorkers:
    """Two workers bootstrap against the same empty database."""

    def test_survives_a_bootstrap_that_lands_mid_flight(self):
        """The loser of the race must not raise.

        AppUser.email is unique, and bootstrap_admin does an unguarded
        check-then-insert. The gap between the SELECT and the COMMIT contains
        the bcrypt hash - hundreds of milliseconds - so the other worker has
        ample time to land its row in between. Simulate exactly that
        interleaving by committing a competing admin from inside the hash.
        """
        def hash_then_let_the_other_worker_win(password):
            other = TestingSessionLocal()
            try:
                other.add(AppUser(
                    id="admin-from-other-worker",
                    name="Admin",
                    email=ADMIN_EMAIL,
                    hashed_password="hashed-elsewhere",
                    role=UserRoleEnum.ADMIN,
                    is_admin=True,
                    is_active=True,
                    is_verified=True,
                ))
                other.commit()
            finally:
                other.close()
            return "hashed-here"

        with patch(
            "backend.bootstrap_admin.get_password_hash",
            side_effect=hash_then_let_the_other_worker_win,
        ):
            # Must not raise IntegrityError: this runs at import of main.py,
            # so an exception kills the worker before it can serve anything.
            bootstrap_admin()

        # And the database must still hold exactly one admin.
        assert len(admin_rows()) == 1

    def test_an_unrelated_integrity_error_still_surfaces(self):
        """Losing the race is benign; a real constraint problem is not.

        Tolerating every IntegrityError would hide genuine schema or data
        faults behind a silent no-op at startup.
        """
        def session_that_cannot_commit():
            session = TestingSessionLocal()
            def boom():
                raise IntegrityError("INSERT ...", {}, Exception("other constraint"))
            session.commit = boom
            return session

        with patch(
            "backend.bootstrap_admin.SessionLocal", session_that_cannot_commit
        ):
            with pytest.raises(IntegrityError):
                bootstrap_admin()

        assert admin_rows() == []

    def test_two_real_threads_produce_one_admin(self):
        """Belt and braces: the same thing without a simulated interleaving."""
        errors = []
        barrier = threading.Barrier(2)

        def worker():
            try:
                barrier.wait()
                bootstrap_admin()
            except Exception as exc:  # noqa: BLE001 - recorded, asserted below
                errors.append(exc)

        threads = [threading.Thread(target=worker) for _ in range(2)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert errors == [], f"bootstrap raised under concurrency: {errors}"
        assert len(admin_rows()) == 1
