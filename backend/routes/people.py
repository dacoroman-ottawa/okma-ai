from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Annotated, Any
from ..database import get_db
from ..models import Teacher, Student, AppUser, UserRoleEnum, AvailabilitySlot, SkillLevel, Instrument
from ..auth import get_current_user, RoleChecker
from ..services.email import send_welcome_email
import uuid

router = APIRouter(prefix="/people", tags=["people"])

# Common dependencies
DB = Annotated[Any, Depends(get_db)]
CurrentUser = Annotated[Any, Depends(get_current_user)]
AdminUser = Annotated[Any, Depends(RoleChecker([UserRoleEnum.ADMIN]))]

@router.get("/instruments")
async def get_instruments(db: Any = Depends(get_db)):
    return db.query(Instrument).all()

# Teachers Endpoints
@router.get("/teachers", response_model=List[dict])
async def get_teachers(
    db: Any = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    query = db.query(Teacher)
    
    # RBAC: Teachers only see themselves, Admins see all
    if current_user.role == UserRoleEnum.TEACHER:
        teachers = query.filter(Teacher.user_id == current_user.id).all()
        return [
        {
            "id": t.id,
            "name": t.name,
            "email": t.email,
            "primaryContact": t.primary_contact,
            "specialization": t.specialization,
            "qualification": t.qualification,
            "active": t.active,
            "instrumentsTaught": [i.id for i in t.instruments]
        } for t in teachers
    ]
    
    if current_user.role == UserRoleEnum.STUDENT:
        # Students might need to see all teachers for enrollment, 
        # but for now let's stick to the requirement: Admins see all.
        # Actually, user said: "Teachers should see only their own students and availability"
        # Implicitly, Admins manage the list.
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized")
            
    teachers = query.all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "email": t.email,
            "primaryContact": t.primary_contact,
            "specialization": t.specialization,
            "qualification": t.qualification,
            "active": t.active,
            "instrumentsTaught": [i.id for i in t.instruments]
        } for t in teachers
    ]

@router.get("/teachers/{teacher_id}")
async def get_teacher(
    teacher_id: str,
    db: Any = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # RBAC: Check ownership or Admin
    if not current_user.is_admin and current_user.id != teacher.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return {
        "id": teacher.id,
        "name": teacher.name,
        "email": teacher.email,
        "primaryContact": teacher.primary_contact,
        "address": teacher.address,
        "biography": teacher.biography,
        "specialization": teacher.specialization,
        "qualification": teacher.qualification,
        "active": teacher.active,
        "dateOfEnrollment": teacher.date_of_enrollment,
        "dateOfBirth": teacher.date_of_birth,
        "socialInsuranceNumber": teacher.social_insurance_number,
        "hourlyRate": teacher.hourly_rate,
        "instrumentsTaught": [i.id for i in teacher.instruments],
        "instruments": [{"id": i.id, "name": i.name} for i in teacher.instruments],
        "availability": [
            {
                "day": slot.day,
                "startTime": slot.start_time,
                "endTime": slot.end_time
            } for slot in teacher.availability
        ]
    }

# Students Endpoints
@router.get("/students", response_model=List[dict])
async def get_students(
    db: Any = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    if current_user.role == UserRoleEnum.TEACHER:
        # Link via Enrollments
        from ..models import Enrollment
        students = db.query(Student).join(Enrollment).filter(Enrollment.teacher_id == current_user.teacher.id).all()
    else:
        students = db.query(Student).all()
        
    return [
        {
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "primaryContact": s.primary_contact,
            "active": s.active,
            "skillLevels": [
                {
                    "instrumentId": sl.instrument_id,
                    "level": sl.level
                } for sl in s.skill_levels
            ],
            "availability": [
                {
                    "day": slot.day,
                    "startTime": slot.start_time,
                    "endTime": slot.end_time
                } for slot in s.availability
            ]
        } for s in students
    ]
    
    if current_user.role == UserRoleEnum.STUDENT:
        if current_user.id != query.filter(Student.user_id == current_user.id).first().user_id and not current_user.is_admin:
             raise HTTPException(status_code=403, detail="Not authorized")
        return [current_user.student.__dict__]

    return [s.__dict__ for s in query.all()]

# Create / Update / Delete would follow similar logic...
# I'll implement a basic Teacher creation to show the welcome email trigger
@router.post("/teachers")
async def create_teacher(
    teacher_data: dict, 
    db: Any = Depends(get_db),
    admin: Any = Depends(RoleChecker([UserRoleEnum.ADMIN]))
):
    # 1. Create AppUser
    user_id = str(uuid.uuid4())
    new_user = AppUser(
        id=user_id,
        name=teacher_data["name"],
        email=teacher_data["email"],
        role=UserRoleEnum.TEACHER,
        hashed_password="TEMP_PASSWORD", # In reality, generate a random one and send reset link
        is_active=True
    )
    db.add(new_user)
    
    # 2. Create Teacher profile
    teacher_id = "tch-" + str(uuid.uuid4())[:8]
    new_teacher = Teacher(
        id=teacher_id,
        user_id=user_id,
        name=teacher_data["name"],
        email=teacher_data["email"],
        specialization=teacher_data.get("specialization"),
        hourly_rate=teacher_data.get("hourly_rate", 0),
        qualification=teacher_data.get("qualification")
    )
    db.add(new_teacher)
    db.commit()
    
    # 3. Trigger Welcome Email
    await send_welcome_email(new_user.email, new_user.name, "Teacher")

    return new_teacher

@router.put("/teachers/{teacher_id}")
async def update_teacher(
    teacher_id: str,
    teacher_data: dict,
    db: Any = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # RBAC: Only admin or the teacher themselves can update
    if not current_user.is_admin and current_user.id != teacher.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update allowed fields
    if "name" in teacher_data:
        teacher.name = teacher_data["name"]
        # Also update the associated AppUser name
        if teacher.user:
            teacher.user.name = teacher_data["name"]
    if "email" in teacher_data:
        teacher.email = teacher_data["email"]
        if teacher.user:
            teacher.user.email = teacher_data["email"]
    if "primaryContact" in teacher_data:
        teacher.primary_contact = teacher_data["primaryContact"]
    if "address" in teacher_data:
        teacher.address = teacher_data["address"]
    if "biography" in teacher_data:
        teacher.biography = teacher_data["biography"]
    if "specialization" in teacher_data:
        teacher.specialization = teacher_data["specialization"]
    if "qualification" in teacher_data:
        from ..models import QualificationEnum
        qual_value = teacher_data["qualification"]
        # Handle both enum value strings and display names
        qual_map = {
            "Bachelor of Music": QualificationEnum.BACHELOR,
            "Master": QualificationEnum.MASTER,
            "Doctorate": QualificationEnum.DOCTORATE,
            "Professional Certificate": QualificationEnum.CERTIFICATE,
            "Self-Taught Professional": QualificationEnum.SELF_TAUGHT,
        }
        if qual_value in qual_map:
            teacher.qualification = qual_map[qual_value]
    if "hourlyRate" in teacher_data:
        teacher.hourly_rate = teacher_data["hourlyRate"]
    if "active" in teacher_data:
        teacher.active = teacher_data["active"]
    if "dateOfBirth" in teacher_data:
        from datetime import date
        dob = teacher_data["dateOfBirth"]
        if dob:
            teacher.date_of_birth = date.fromisoformat(dob) if isinstance(dob, str) else dob
        else:
            teacher.date_of_birth = None
    if "dateOfEnrollment" in teacher_data:
        from datetime import date
        doe = teacher_data["dateOfEnrollment"]
        if doe:
            teacher.date_of_enrollment = date.fromisoformat(doe) if isinstance(doe, str) else doe
    if "socialInsuranceNumber" in teacher_data:
        teacher.social_insurance_number = teacher_data["socialInsuranceNumber"]

    # Update instruments
    if "instrumentsTaught" in teacher_data:
        instrument_ids = teacher_data["instrumentsTaught"]
        instruments = db.query(Instrument).filter(Instrument.id.in_(instrument_ids)).all()
        teacher.instruments = instruments

    db.commit()
    db.refresh(teacher)

    return {
        "id": teacher.id,
        "name": teacher.name,
        "email": teacher.email,
        "primaryContact": teacher.primary_contact,
        "address": teacher.address,
        "biography": teacher.biography,
        "specialization": teacher.specialization,
        "qualification": teacher.qualification.value if teacher.qualification else None,
        "active": teacher.active,
        "dateOfEnrollment": teacher.date_of_enrollment,
        "dateOfBirth": teacher.date_of_birth,
        "socialInsuranceNumber": teacher.social_insurance_number,
        "hourlyRate": teacher.hourly_rate,
        "instrumentsTaught": [i.id for i in teacher.instruments],
    }

@router.get("/students/{student_id}")
async def get_student(
    student_id: str,
    db: Any = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # RBAC: Admin sees all, student sees self
    if not current_user.is_admin and current_user.id != student.user_id:
        # Also allow teachers who have this student enrolled
        if current_user.role == UserRoleEnum.TEACHER:
            from ..models import Enrollment
            enrollment = db.query(Enrollment).filter(
                Enrollment.student_id == student_id,
                Enrollment.teacher_id == current_user.teacher.id if hasattr(current_user, 'teacher') and current_user.teacher else None
            ).first()
            if not enrollment:
                raise HTTPException(status_code=403, detail="Not authorized")
        else:
            raise HTTPException(status_code=403, detail="Not authorized")

    return {
        "id": student.id,
        "name": student.name,
        "email": student.email,
        "primaryContact": student.primary_contact,
        "address": student.address,
        "dateOfBirth": student.date_of_birth,
        "active": student.active,
        "skillLevels": [
            {
                "instrumentId": sl.instrument_id,
                "level": sl.level.value if sl.level else None
            } for sl in student.skill_levels
        ],
        "availability": [
            {
                "day": slot.day,
                "startTime": slot.start_time,
                "endTime": slot.end_time
            } for slot in student.availability
        ]
    }

@router.put("/students/{student_id}")
async def update_student(
    student_id: str,
    student_data: dict,
    db: Any = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # RBAC: Only admin or the student themselves can update
    if not current_user.is_admin and current_user.id != student.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update allowed fields
    if "name" in student_data:
        student.name = student_data["name"]
        if student.user:
            student.user.name = student_data["name"]
    if "email" in student_data:
        student.email = student_data["email"]
        if student.user:
            student.user.email = student_data["email"]
    if "primaryContact" in student_data:
        student.primary_contact = student_data["primaryContact"]
    if "address" in student_data:
        student.address = student_data["address"]
    if "active" in student_data:
        student.active = student_data["active"]
    if "dateOfBirth" in student_data:
        from datetime import date
        dob = student_data["dateOfBirth"]
        if dob:
            student.date_of_birth = date.fromisoformat(dob) if isinstance(dob, str) else dob
        else:
            student.date_of_birth = None

    # Update skill levels if provided
    if "skillLevels" in student_data:
        from ..models import SkillLevelEnum
        # Clear existing skill levels
        for sl in student.skill_levels:
            db.delete(sl)

        # Add new skill levels
        for skill_data in student_data["skillLevels"]:
            level_map = {
                "Beginner": SkillLevelEnum.BEGINNER,
                "Intermediate": SkillLevelEnum.INTERMEDIATE,
                "Advanced": SkillLevelEnum.ADVANCED,
            }
            new_skill = SkillLevel(
                student_id=student.id,
                instrument_id=skill_data["instrumentId"],
                level=level_map.get(skill_data["level"], SkillLevelEnum.BEGINNER)
            )
            db.add(new_skill)

    db.commit()
    db.refresh(student)

    return {
        "id": student.id,
        "name": student.name,
        "email": student.email,
        "primaryContact": student.primary_contact,
        "address": student.address,
        "dateOfBirth": student.date_of_birth,
        "active": student.active,
        "skillLevels": [
            {
                "instrumentId": sl.instrument_id,
                "level": sl.level.value if sl.level else None
            } for sl in student.skill_levels
        ],
    }
