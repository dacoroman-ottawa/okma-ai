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
