import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.database import get_db, Base
from backend.models import (
    AppUser, Teacher, Instrument, UserRoleEnum, QualificationEnum
)
from backend.auth import get_current_user

# Setup test database (SQLite for tests)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_teachers.db"
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
        name="Admin",
        email="admin@test.com",
        hashed_password="hashed",
        role=UserRoleEnum.ADMIN,
        is_admin=True
    )
    db.add(admin_user)

    # Create teacher user
    teacher_user = AppUser(
        id="user-tch-1",
        name="John Smith",
        email="john@test.com",
        hashed_password="hashed",
        role=UserRoleEnum.TEACHER
    )
    db.add(teacher_user)

    # Create teacher
    teacher = Teacher(
        id="tch-1",
        user_id="user-tch-1",
        name="John Smith",
        email="john@test.com",
        primary_contact="555-1234",
        address="123 Music St",
        specialization="Classical Piano",
        qualification=QualificationEnum.BACHELOR,
        hourly_rate=50.0,
        active=True
    )
    db.add(teacher)

    # Create instruments
    piano = Instrument(id="inst-piano", name="Piano")
    guitar = Instrument(id="inst-guitar", name="Guitar")
    violin = Instrument(id="inst-violin", name="Violin")
    db.add_all([piano, guitar, violin])

    # Associate teacher with piano
    teacher.instruments.append(piano)

    db.commit()
    yield
    Base.metadata.drop_all(bind=engine)


def mock_admin_user():
    return AppUser(id="admin-1", is_admin=True, role=UserRoleEnum.ADMIN, email="admin@test.com", name="Admin", hashed_password="x")


def mock_teacher_user():
    return AppUser(id="user-tch-1", is_admin=False, role=UserRoleEnum.TEACHER, email="john@test.com", name="John Smith", hashed_password="x")


def mock_other_teacher_user():
    return AppUser(id="user-tch-other", is_admin=False, role=UserRoleEnum.TEACHER, email="other@test.com", name="Other", hashed_password="x")


class TestUpdateTeacher:
    """Tests for PUT /people/teachers/{teacher_id}"""

    def test_update_teacher_name_as_admin(self):
        """Admin can update teacher name"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/teachers/tch-1", json={
            "name": "John William Smith"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "John William Smith"

    def test_update_teacher_email_as_admin(self):
        """Admin can update teacher email"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/teachers/tch-1", json={
            "email": "johnsmith@newdomain.com"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "johnsmith@newdomain.com"

    def test_update_teacher_hourly_rate(self):
        """Admin can update teacher hourly rate"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/teachers/tch-1", json={
            "hourlyRate": 75.0
        })

        assert response.status_code == 200
        data = response.json()
        assert data["hourlyRate"] == 75.0

    def test_update_teacher_specialization(self):
        """Admin can update teacher specialization"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/teachers/tch-1", json={
            "specialization": "Jazz Piano"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["specialization"] == "Jazz Piano"

    def test_update_teacher_qualification(self):
        """Admin can update teacher qualification"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/teachers/tch-1", json={
            "qualification": "Master"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["qualification"] == "Master"

    def test_update_teacher_active_status(self):
        """Admin can deactivate a teacher"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/teachers/tch-1", json={
            "active": False
        })

        assert response.status_code == 200
        data = response.json()
        assert data["active"] is False

    def test_update_teacher_multiple_fields(self):
        """Admin can update multiple fields at once"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/teachers/tch-1", json={
            "name": "Jonathan Smith",
            "specialization": "Contemporary Music",
            "hourlyRate": 65.0,
            "biography": "Award-winning pianist with 20 years experience."
        })

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Jonathan Smith"
        assert data["specialization"] == "Contemporary Music"
        assert data["hourlyRate"] == 65.0
        assert data["biography"] == "Award-winning pianist with 20 years experience."

    def test_update_teacher_instruments(self):
        """Admin can update teacher's instruments"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/teachers/tch-1", json={
            "instrumentsTaught": ["inst-piano", "inst-guitar"]
        })

        assert response.status_code == 200
        data = response.json()
        assert set(data["instrumentsTaught"]) == {"inst-piano", "inst-guitar"}

    def test_update_nonexistent_teacher(self):
        """Updating a non-existent teacher returns 404"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/teachers/tch-nonexistent", json={
            "name": "New Name"
        })

        assert response.status_code == 404
        assert response.json()["detail"] == "Teacher not found"

    def test_teacher_can_update_own_profile(self):
        """Teacher can update their own profile"""
        app.dependency_overrides[get_current_user] = mock_teacher_user

        response = client.put("/people/teachers/tch-1", json={
            "primaryContact": "555-9999",
            "biography": "Updated bio"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["primaryContact"] == "555-9999"
        assert data["biography"] == "Updated bio"

    def test_teacher_cannot_update_other_teacher(self):
        """Teacher cannot update another teacher's profile"""
        app.dependency_overrides[get_current_user] = mock_other_teacher_user

        response = client.put("/people/teachers/tch-1", json={
            "name": "Hacked Name"
        })

        assert response.status_code == 403
        assert response.json()["detail"] == "Not authorized"

    def test_update_teacher_contact_info(self):
        """Admin can update contact information"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/teachers/tch-1", json={
            "primaryContact": "555-5678",
            "address": "456 New Address Ave"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["primaryContact"] == "555-5678"
        assert data["address"] == "456 New Address Ave"


class TestGetTeacher:
    """Tests for GET /people/teachers/{teacher_id}"""

    def test_get_teacher_as_admin(self):
        """Admin can get any teacher details"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.get("/people/teachers/tch-1")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "tch-1"
        assert data["name"] == "John Smith"
        assert data["email"] == "john@test.com"
        assert data["specialization"] == "Classical Piano"

    def test_get_teacher_as_self(self):
        """Teacher can view their own details"""
        app.dependency_overrides[get_current_user] = mock_teacher_user

        response = client.get("/people/teachers/tch-1")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "tch-1"

    def test_get_nonexistent_teacher(self):
        """Getting a non-existent teacher returns 404"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.get("/people/teachers/tch-nonexistent")

        assert response.status_code == 404


class TestGetTeachers:
    """Tests for GET /people/teachers"""

    def test_get_teachers_list_as_admin(self):
        """Admin can get list of all teachers"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.get("/people/teachers")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(t["id"] == "tch-1" for t in data)
