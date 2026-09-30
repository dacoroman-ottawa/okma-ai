import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from .database import SessionLocal, init_db, engine
from .models import (
    Base, AppUser, Teacher, Student, Instrument, UserRoleEnum,
    QualificationEnum, SkillLevelEnum, SkillLevel, AvailabilitySlot,
    Enrollment, Class, AttendanceRecord, AttendanceStatusEnum, ClassTypeEnum
)

BACKEND_DIR = Path(__file__).resolve().parent
REPO_ROOT = BACKEND_DIR.parent

def load_sample_data(section):
    """Load a section's sample-data.json, wherever it happens to live.

    product-plan/ holds the canonical fixtures but sits outside the backend Docker build
    context, so copies are bundled in backend/seed_data/ to let the image seed itself.
    SEED_DATA_DIR overrides both (expects <dir>/<section>/sample-data.json).
    """
    candidates = []
    override = os.environ.get("SEED_DATA_DIR")
    if override:
        candidates.append(Path(override) / section / "sample-data.json")
    candidates.append(REPO_ROOT / "product-plan" / "sections" / section / "sample-data.json")
    candidates.append(BACKEND_DIR / "seed_data" / section / "sample-data.json")

    for path in candidates:
        if path.is_file():
            with open(path, "r") as f:
                return json.load(f)

    raise FileNotFoundError(
        f"No sample-data.json found for section '{section}'. Looked in: "
        + ", ".join(str(p) for p in candidates)
    )

def seed_data():
    # Drop all and recreate for a clean seed
    Base.metadata.drop_all(bind=engine)
    init_db()
    
    db = SessionLocal()
    
    # 1. Load sample data
    data = load_sample_data("people")

    # 2. Seed Instruments
    instruments_map = {}
    for inst in data["instruments"]:
        new_inst = Instrument(id=inst["id"], name=inst["name"])
        db.add(new_inst)
        instruments_map[inst["id"]] = new_inst

    # 3. Seed Admin
    admin_id = str(uuid.uuid4())
    admin_user = AppUser(
        id=admin_id,
        name="Admin",
        email="admin@kanatamusic.com",
        role=UserRoleEnum.ADMIN,
        hashed_password=get_password_hash("admin123"),
        is_admin=True,
        is_verified=True
    )
    db.add(admin_user)

    # 4. Seed Teachers
    teachers_map = {}
    for tch in data["teachers"]:
        user_id = str(uuid.uuid4())
        user = AppUser(
            id=user_id,
            name=tch["name"],
            email=tch["email"],
            role=UserRoleEnum.TEACHER,
            hashed_password=get_password_hash("teacher123"),
            is_active=tch["active"],
            is_verified=True
        )
        db.add(user)
        
        new_tch = Teacher(
            id=tch["id"],
            user_id=user_id,
            name=tch["name"],
            email=tch["email"],
            primary_contact=tch["primaryContact"],
            address=tch["address"],
            biography=tch["biography"],
            specialization=tch["specialization"],
            qualification=QualificationEnum(tch["qualification"]),
            date_of_enrollment=datetime.strptime(tch["dateOfEnrollment"], "%Y-%m-%d").date() if tch.get("dateOfEnrollment") else None,
            date_of_birth=datetime.strptime(tch["dateOfBirth"], "%Y-%m-%d").date() if tch.get("dateOfBirth") else None,
            social_insurance_number=tch["socialInsuranceNumber"],
            hourly_rate=tch["hourlyRate"],
            active=tch["active"]
        )
        for inst_id in tch["instrumentsTaught"]:
            new_tch.instruments.append(instruments_map[inst_id])
            
        db.add(new_tch)
        teachers_map[tch["id"]] = new_tch

    # 5. Seed Students
    students_map = {}
    for stu in data["students"]:
        user_id = str(uuid.uuid4())
        user = AppUser(
            id=user_id,
            name=stu["name"],
            email=stu["email"],
            role=UserRoleEnum.STUDENT,
            hashed_password=get_password_hash("student123"),
            is_active=stu["active"],
            is_verified=True
        )
        db.add(user)
        
        new_stu = Student(
            id=stu["id"],
            user_id=user_id,
            name=stu["name"],
            email=stu["email"],
            primary_contact=stu["primaryContact"],
            address=stu["address"],
            date_of_birth=datetime.strptime(stu["dateOfBirth"], "%Y-%m-%d").date() if stu.get("dateOfBirth") else None,
            active=stu["active"]
        )
        db.add(new_stu)
        students_map[stu["id"]] = new_stu
        
        for sk in stu["skillLevels"]:
            skill = SkillLevel(
                student_id=stu["id"],
                instrument_id=sk["instrumentId"],
                level=SkillLevelEnum(sk["level"])
            )
            db.add(skill)

    # 6. Seed Enrollments
    for enr in data["enrollments"]:
        new_enr = Enrollment(
            id=enr["id"],
            student_id=enr["studentId"],
            teacher_id=enr["teacherId"],
            instrument_id=enr["instrumentId"],
            start_date=datetime.strptime(enr["startDate"], "%Y-%m-%d").date() if enr.get("startDate") else None
        )
        db.add(new_enr)

    # 7. Seed Availability
    for tch_id, slots in data["teacherAvailability"].items():
        for slot in slots:
            new_slot = AvailabilitySlot(
                teacher_id=tch_id,
                day=slot["day"],
                start_time=slot["startTime"],
                end_time=slot["endTime"]
            )
            db.add(new_slot)

    for stu_id, slots in data["studentAvailability"].items():
        for slot in slots:
            new_slot = AvailabilitySlot(
                student_id=stu_id,
                day=slot["day"],
                start_time=slot["startTime"],
                end_time=slot["endTime"]
            )
            db.add(new_slot)

    # 8. Seed Classes
    class_data = load_sample_data("classes")

    for cls in class_data["classes"]:
        new_class = Class(
            id=cls["id"],
            teacher_id=cls["teacherId"],
            instrument_id=cls["instrumentId"],
            weekday=cls["weekday"],
            start_time=cls["startTime"],
            duration=cls["duration"],
            frequency=cls["frequency"],
            type=ClassTypeEnum(cls["type"]),
            notes=cls.get("notes")
        )
        # Add students
        for sid in cls["studentIds"]:
            if sid in students_map:
                new_class.students.append(students_map[sid])
        db.add(new_class)

    # 9. Seed Attendance
    for att in class_data["attendanceRecords"]:
        new_att = AttendanceRecord(
            id=att["id"],
            class_id=att["classId"],
            student_id=att["studentId"],
            date=datetime.strptime(att["date"], "%Y-%m-%d").date(),
            # Fixtures record a boolean; the model tracks a status enum
            status=AttendanceStatusEnum.PRESENT if att["attended"] else AttendanceStatusEnum.ABSENT
        )
        db.add(new_att)

    db.commit()
    print("Database seeded successfully!")

def get_password_hash(password):
    # Importing here to avoid dependency issue during seed if bcrypt not fully ready
    from .auth import get_password_hash as hash_fn
    return hash_fn(password)

if __name__ == "__main__":
    seed_data()
