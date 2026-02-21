import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.database import get_db, Base
from backend.models import AppUser, UserRoleEnum
from backend.auth import get_current_user

# Setup test database (SQLite for tests)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_users.db"
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

    # Create admin user
    admin_user = AppUser(
        id="admin-1",
        name="Admin User",
        email="admin@test.com",
        hashed_password="hashed",
        role=UserRoleEnum.ADMIN,
        is_admin=True,
        is_active=True
    )
    db.add(admin_user)

    # Create regular user
    regular_user = AppUser(
        id="user-1",
        name="Regular User",
        email="user@test.com",
        hashed_password="hashed",
        role=UserRoleEnum.STUDENT,
        is_admin=False,
        is_active=True
    )
    db.add(regular_user)

    # Create inactive user
    inactive_user = AppUser(
        id="user-2",
        name="Inactive User",
        email="inactive@test.com",
        hashed_password="hashed",
        role=UserRoleEnum.STUDENT,
        is_admin=False,
        is_active=False
    )
    db.add(inactive_user)

    db.commit()
    yield
    Base.metadata.drop_all(bind=engine)


def mock_admin_user():
    return AppUser(
        id="admin-1",
        name="Admin User",
        email="admin@test.com",
        hashed_password="x",
        role=UserRoleEnum.ADMIN,
        is_admin=True
    )


def mock_non_admin_user():
    return AppUser(
        id="user-1",
        name="Regular User",
        email="user@test.com",
        hashed_password="x",
        role=UserRoleEnum.STUDENT,
        is_admin=False
    )


class TestGetUsers:
    """Tests for GET /users"""

    def test_get_users_as_admin(self):
        """Admin can get list of all users"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.get("/users")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3
        assert any(u["id"] == "admin-1" for u in data)
        assert any(u["id"] == "user-1" for u in data)

    def test_get_users_as_non_admin(self):
        """Non-admin cannot access users list"""
        app.dependency_overrides[get_current_user] = mock_non_admin_user

        response = client.get("/users")

        assert response.status_code == 403


class TestGetUser:
    """Tests for GET /users/{user_id}"""

    def test_get_user_as_admin(self):
        """Admin can get any user details"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.get("/users/user-1")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "user-1"
        assert data["name"] == "Regular User"
        assert data["email"] == "user@test.com"
        assert data["isAdmin"] is False

    def test_get_nonexistent_user(self):
        """Getting a non-existent user returns 404"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.get("/users/nonexistent")

        assert response.status_code == 404
        assert response.json()["detail"] == "User not found"


class TestCreateUser:
    """Tests for POST /users"""

    def test_create_user_as_admin(self):
        """Admin can create a new user"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.post("/users", json={
            "name": "New User",
            "email": "newuser@test.com",
            "isAdmin": False
        })

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New User"
        assert data["email"] == "newuser@test.com"
        assert data["isAdmin"] is False
        assert data["isActive"] is True

    def test_create_admin_user(self):
        """Admin can create another admin user"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.post("/users", json={
            "name": "New Admin",
            "email": "newadmin@test.com",
            "isAdmin": True
        })

        assert response.status_code == 200
        data = response.json()
        assert data["isAdmin"] is True

    def test_create_user_duplicate_email(self):
        """Cannot create user with duplicate email"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.post("/users", json={
            "name": "Duplicate",
            "email": "admin@test.com"
        })

        assert response.status_code == 400
        assert response.json()["detail"] == "Email already exists"

    def test_create_user_missing_name(self):
        """Cannot create user without name"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.post("/users", json={
            "email": "missing@test.com"
        })

        assert response.status_code == 400
        assert response.json()["detail"] == "Name is required"

    def test_create_user_missing_email(self):
        """Cannot create user without email"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.post("/users", json={
            "name": "Missing Email"
        })

        assert response.status_code == 400
        assert response.json()["detail"] == "Email is required"


class TestUpdateUser:
    """Tests for PUT /users/{user_id}"""

    def test_update_user_name(self):
        """Admin can update user name"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/users/user-1", json={
            "name": "Updated Name"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"

    def test_update_user_email(self):
        """Admin can update user email"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/users/user-1", json={
            "email": "newemail@test.com"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newemail@test.com"

    def test_update_user_admin_flag(self):
        """Admin can grant admin status to another user"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/users/user-1", json={
            "isAdmin": True
        })

        assert response.status_code == 200
        data = response.json()
        assert data["isAdmin"] is True

    def test_cannot_remove_own_admin_status(self):
        """Admin cannot remove their own admin status"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/users/admin-1", json={
            "isAdmin": False
        })

        assert response.status_code == 400
        assert response.json()["detail"] == "Cannot remove your own admin status"

    def test_update_user_duplicate_email(self):
        """Cannot update user to have duplicate email"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/users/user-1", json={
            "email": "admin@test.com"
        })

        assert response.status_code == 400
        assert response.json()["detail"] == "Email already exists"

    def test_update_nonexistent_user(self):
        """Updating non-existent user returns 404"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/users/nonexistent", json={
            "name": "New Name"
        })

        assert response.status_code == 404


class TestDeleteUser:
    """Tests for DELETE /users/{user_id}"""

    def test_delete_user(self):
        """Admin can delete a user"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.delete("/users/user-1")

        assert response.status_code == 200
        assert response.json()["message"] == "User deleted successfully"

        # Verify user is actually deleted
        get_response = client.get("/users/user-1")
        assert get_response.status_code == 404

    def test_cannot_delete_self(self):
        """Admin cannot delete their own account"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.delete("/users/admin-1")

        assert response.status_code == 400
        assert response.json()["detail"] == "Cannot delete your own account"

    def test_delete_nonexistent_user(self):
        """Deleting non-existent user returns 404"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.delete("/users/nonexistent")

        assert response.status_code == 404


class TestToggleStatus:
    """Tests for POST /users/{user_id}/toggle-status"""

    def test_toggle_user_active_to_inactive(self):
        """Admin can deactivate an active user"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.post("/users/user-1/toggle-status")

        assert response.status_code == 200
        data = response.json()
        assert data["isActive"] is False

    def test_toggle_user_inactive_to_active(self):
        """Admin can activate an inactive user"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.post("/users/user-2/toggle-status")

        assert response.status_code == 200
        data = response.json()
        assert data["isActive"] is True

    def test_cannot_toggle_own_status(self):
        """Admin cannot toggle their own status"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.post("/users/admin-1/toggle-status")

        assert response.status_code == 400
        assert response.json()["detail"] == "Cannot toggle your own status"

    def test_toggle_nonexistent_user(self):
        """Toggling non-existent user returns 404"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.post("/users/nonexistent/toggle-status")

        assert response.status_code == 404


class TestSendResetLink:
    """Tests for POST /users/{user_id}/send-reset-link"""

    def test_send_reset_link(self):
        """Admin can send password reset link"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.post("/users/user-1/send-reset-link")

        assert response.status_code == 200
        assert response.json()["message"] == "Password reset link sent successfully"

    def test_send_reset_link_nonexistent_user(self):
        """Sending reset link to non-existent user returns 404"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.post("/users/nonexistent/send-reset-link")

        assert response.status_code == 404
