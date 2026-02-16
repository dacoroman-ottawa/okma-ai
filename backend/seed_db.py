import json
import uuid
from sqlalchemy.orm import Session
from .database import SessionLocal, init_db
from .models import AppUser, Teacher, Student, Instrument, UserRoleEnum, QualificationEnum, SkillLevelEnum, SkillLevel, AvailabilitySlot, Enrollment
from .auth import get_password_hash

def seed_data():
    db = SessionLocal()
    init_db()
    
    # Check if data already exists
    if db.query(Instrument).first():
        print("Data already seeded.")
        return

    # 1. Load sample data
    with open("product-plan/sections/people/sample-data.json", "r") as f:
        data = json.load(f)

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
            date_of_enrollment=None, # Parse date if needed
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
            instrument_id=enr["instrumentId"]
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

    db.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
