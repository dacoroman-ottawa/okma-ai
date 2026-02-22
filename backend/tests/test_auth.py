import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.database import get_db, Base
from backend.models import AppUser, UserRoleEnum
from backend.auth import get_password_hash, create_password_reset_token

# Setup test database (SQLite for tests)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Create active user with known password
    active_user = AppUser(
        id="user-active",
        name="Active User",
        email="active@test.com",
        hashed_password=get_password_hash("password123"),
        role=UserRoleEnum.ADMIN,
        is_admin=True,
        is_active=True
    )
    db.add(active_user)

    # Create inactive user
    inactive_user = AppUser(
        id="user-inactive",
        name="Inactive User",
        email="inactive@test.com",
        hashed_password=get_password_hash("password123"),
        role=UserRoleEnum.STUDENT,
        is_admin=False,
        is_active=False
    )
    db.add(inactive_user)

    db.commit()
    yield
    Base.metadata.drop_all(bind=engine)


class TestLogin:
    """Tests for POST /auth/login"""

    def test_login_success(self):
        """User can login with correct credentials"""
        response = client.post("/auth/login", json={
            "email": "active@test.com",
            "password": "password123"
        })

        assert response.status_code == 200
        data = response.json()
        assert "accessToken" in data
        assert data["tokenType"] == "bearer"
        assert data["user"]["email"] == "active@test.com"
        assert data["user"]["name"] == "Active User"
        assert data["user"]["isAdmin"] is True

    def test_login_wrong_password(self):
        """Login fails with wrong password"""
        response = client.post("/auth/login", json={
            "email": "active@test.com",
            "password": "wrongpassword"
        })

        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect email or password"

    def test_login_wrong_email(self):
        """Login fails with non-existent email"""
        response = client.post("/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "password123"
        })

        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect email or password"

    def test_login_inactive_user(self):
        """Inactive user cannot login"""
        response = client.post("/auth/login", json={
            "email": "inactive@test.com",
            "password": "password123"
        })

        assert response.status_code == 403
        assert "deactivated" in response.json()["detail"].lower()


class TestForgotPassword:
    """Tests for POST /auth/forgot-password"""

    def test_forgot_password_existing_user(self):
        """Forgot password returns success for existing user"""
        response = client.post("/auth/forgot-password", json={
            "email": "active@test.com"
        })

        assert response.status_code == 200
        assert "reset link has been sent" in response.json()["message"].lower()

    def test_forgot_password_nonexistent_user(self):
        """Forgot password returns same message for non-existent user (no enumeration)"""
        response = client.post("/auth/forgot-password", json={
            "email": "nonexistent@test.com"
        })

        assert response.status_code == 200
        assert "reset link has been sent" in response.json()["message"].lower()

    def test_forgot_password_inactive_user(self):
        """Forgot password returns same message for inactive user"""
        response = client.post("/auth/forgot-password", json={
            "email": "inactive@test.com"
        })

        assert response.status_code == 200
        assert "reset link has been sent" in response.json()["message"].lower()


class TestResetPassword:
    """Tests for POST /auth/reset-password"""

    def test_reset_password_success(self):
        """Can reset password with valid token"""
        token = create_password_reset_token("active@test.com")

        response = client.post("/auth/reset-password", json={
            "token": token,
            "email": "active@test.com",
            "newPassword": "newpassword123"
        })

        assert response.status_code == 200
        assert response.json()["message"] == "Password reset successfully"

        # Verify can login with new password
        login_response = client.post("/auth/login", json={
            "email": "active@test.com",
            "password": "newpassword123"
        })
        assert login_response.status_code == 200

    def test_reset_password_invalid_token(self):
        """Reset fails with invalid token"""
        response = client.post("/auth/reset-password", json={
            "token": "invalid-token",
            "email": "active@test.com",
            "newPassword": "newpassword123"
        })

        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()

    def test_reset_password_wrong_email(self):
        """Reset fails when email doesn't match token"""
        token = create_password_reset_token("active@test.com")

        response = client.post("/auth/reset-password", json={
            "token": token,
            "email": "other@test.com",
            "newPassword": "newpassword123"
        })

        assert response.status_code == 400

    def test_reset_password_short_password(self):
        """Reset fails with password less than 8 characters"""
        token = create_password_reset_token("active@test.com")

        response = client.post("/auth/reset-password", json={
            "token": token,
            "email": "active@test.com",
            "newPassword": "short"
        })

        assert response.status_code == 400
        assert "8 characters" in response.json()["detail"]
