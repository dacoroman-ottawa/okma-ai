import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.database import get_db, Base
from backend.models import (
    AppUser, Student, Instrument, UserRoleEnum, SkillLevel, SkillLevelEnum
)
from backend.auth import get_current_user

# Setup test database (SQLite for tests)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_students.db"
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

    # Create student user
    student_user = AppUser(
        id="user-stu-1",
        name="Jane Doe",
        email="jane@test.com",
        hashed_password="hashed",
        role=UserRoleEnum.STUDENT
    )
    db.add(student_user)

    # Create student
    student = Student(
        id="stu-1",
        user_id="user-stu-1",
        name="Jane Doe",
        email="jane@test.com",
        primary_contact="555-1234",
        address="123 Student St",
        active=True
    )
    db.add(student)

    # Create instruments
    piano = Instrument(id="inst-piano", name="Piano")
    guitar = Instrument(id="inst-guitar", name="Guitar")
    violin = Instrument(id="inst-violin", name="Violin")
    db.add_all([piano, guitar, violin])

    # Add skill level for student
    skill = SkillLevel(
        student_id="stu-1",
        instrument_id="inst-piano",
        level=SkillLevelEnum.BEGINNER
    )
    db.add(skill)

    db.commit()
    yield
    Base.metadata.drop_all(bind=engine)


def mock_admin_user():
    return AppUser(id="admin-1", is_admin=True, role=UserRoleEnum.ADMIN, email="admin@test.com", name="Admin", hashed_password="x")


def mock_student_user():
    return AppUser(id="user-stu-1", is_admin=False, role=UserRoleEnum.STUDENT, email="jane@test.com", name="Jane Doe", hashed_password="x")


def mock_other_student_user():
    return AppUser(id="user-stu-other", is_admin=False, role=UserRoleEnum.STUDENT, email="other@test.com", name="Other", hashed_password="x")


class TestUpdateStudent:
    """Tests for PUT /people/students/{student_id}"""

    def test_update_student_name_as_admin(self):
        """Admin can update student name"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/students/stu-1", json={
            "name": "Jane Marie Doe"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Jane Marie Doe"

    def test_update_student_email_as_admin(self):
        """Admin can update student email"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/students/stu-1", json={
            "email": "janedoe@newdomain.com"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "janedoe@newdomain.com"

    def test_update_student_contact_info(self):
        """Admin can update contact information"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/students/stu-1", json={
            "primaryContact": "555-5678",
            "address": "456 New Address Ave"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["primaryContact"] == "555-5678"
        assert data["address"] == "456 New Address Ave"

    def test_update_student_active_status(self):
        """Admin can deactivate a student"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/students/stu-1", json={
            "active": False
        })

        assert response.status_code == 200
        data = response.json()
        assert data["active"] is False

    def test_update_student_multiple_fields(self):
        """Admin can update multiple fields at once"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/students/stu-1", json={
            "name": "Janet Doe",
            "primaryContact": "555-9999",
            "address": "789 Updated St"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Janet Doe"
        assert data["primaryContact"] == "555-9999"
        assert data["address"] == "789 Updated St"

    def test_update_student_skill_levels(self):
        """Admin can update student's skill levels"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/students/stu-1", json={
            "skillLevels": [
                {"instrumentId": "inst-piano", "level": "Advanced"},
                {"instrumentId": "inst-guitar", "level": "Beginner"}
            ]
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data["skillLevels"]) == 2
        # Check that skill levels are updated
        skill_map = {s["instrumentId"]: s["level"] for s in data["skillLevels"]}
        assert skill_map.get("inst-piano") == "Advanced"
        assert skill_map.get("inst-guitar") == "Beginner"

    def test_update_nonexistent_student(self):
        """Updating a non-existent student returns 404"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/students/stu-nonexistent", json={
            "name": "New Name"
        })

        assert response.status_code == 404
        assert response.json()["detail"] == "Student not found"

    def test_student_can_update_own_profile(self):
        """Student can update their own profile"""
        app.dependency_overrides[get_current_user] = mock_student_user

        response = client.put("/people/students/stu-1", json={
            "primaryContact": "555-0000",
            "address": "Updated by student"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["primaryContact"] == "555-0000"
        assert data["address"] == "Updated by student"

    def test_student_cannot_update_other_student(self):
        """Student cannot update another student's profile"""
        app.dependency_overrides[get_current_user] = mock_other_student_user

        response = client.put("/people/students/stu-1", json={
            "name": "Hacked Name"
        })

        assert response.status_code == 403
        assert response.json()["detail"] == "Not authorized"

    def test_update_student_date_of_birth(self):
        """Admin can update date of birth"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.put("/people/students/stu-1", json={
            "dateOfBirth": "2010-05-15"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["dateOfBirth"] == "2010-05-15"


class TestGetStudent:
    """Tests for GET /people/students/{student_id}"""

    def test_get_student_as_admin(self):
        """Admin can get any student details"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.get("/people/students/stu-1")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "stu-1"
        assert data["name"] == "Jane Doe"
        assert data["email"] == "jane@test.com"

    def test_get_student_as_self(self):
        """Student can view their own details"""
        app.dependency_overrides[get_current_user] = mock_student_user

        response = client.get("/people/students/stu-1")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "stu-1"

    def test_get_nonexistent_student(self):
        """Getting a non-existent student returns 404"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.get("/people/students/stu-nonexistent")

        assert response.status_code == 404

    def test_get_student_includes_skill_levels(self):
        """Student detail includes skill levels"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.get("/people/students/stu-1")

        assert response.status_code == 200
        data = response.json()
        assert "skillLevels" in data
        assert len(data["skillLevels"]) >= 1


class TestGetStudents:
    """Tests for GET /people/students"""

    def test_get_students_list_as_admin(self):
        """Admin can get list of all students"""
        app.dependency_overrides[get_current_user] = mock_admin_user

        response = client.get("/people/students")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(s["id"] == "stu-1" for s in data)
