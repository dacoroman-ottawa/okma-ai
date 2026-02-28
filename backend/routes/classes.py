from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from datetime import date, datetime
import uuid

from ..database import get_db
from ..models import (
    Class, AttendanceRecord, Student, Teacher, Instrument, Enrollment,
    ClassTypeEnum, ClassStatusEnum, CreditTransaction, TransactionTypeEnum
)
from ..auth import get_current_user

router = APIRouter(prefix="/classes", tags=["classes"])

@router.get("/")
async def get_classes(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    # For now, return all classes for admins, or filtered for teachers/students
    query = db.query(Class)
    if not current_user.is_admin:
        if current_user.role.value == "teacher":
            query = query.filter(Class.teacher_id == current_user.teacher.id)
        elif current_user.role.value == "student":
            query = query.join(Class.students).filter(Student.id == current_user.student.id)
    
    classes = query.all()
    
    return [
        {
            "id": c.id,
            "teacherId": c.teacher_id,
            "instrumentId": c.instrument_id,
            "studentIds": [s.id for s in c.students],
            "type": c.type.value,
            "weekday": c.weekday,
            "startTime": c.start_time,
            "duration": c.duration,
            "frequency": c.frequency,
            "status": c.status.value,
            "notes": c.notes
        } for c in classes
    ]

@router.post("/")
async def create_class(
    class_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_class = Class(
        id=f"cls-{uuid.uuid4().hex[:8]}",
        teacher_id=class_data["teacherId"],
        instrument_id=class_data["instrumentId"],
        weekday=class_data["weekday"],
        start_time=class_data["startTime"],
        duration=class_data["duration"],
        frequency=class_data.get("frequency", 1),
        type=ClassTypeEnum(class_data["type"]),
        notes=class_data.get("notes"),
        status=ClassStatusEnum.SCHEDULED
    )
    
    # Add students
    if "studentIds" in class_data:
        students = db.query(Student).filter(Student.id.in_(class_data["studentIds"])).all()
        new_class.students = students
        
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    
    return {"id": new_class.id, "status": "created"}

@router.put("/{class_id}")
async def update_class(
    class_id: str,
    class_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    # Update fields
    if "teacherId" in class_data:
        cls.teacher_id = class_data["teacherId"]
    if "instrumentId" in class_data:
        cls.instrument_id = class_data["instrumentId"]
    if "weekday" in class_data:
        cls.weekday = class_data["weekday"]
    if "startTime" in class_data:
        cls.start_time = class_data["startTime"]
    if "duration" in class_data:
        cls.duration = class_data["duration"]
    if "frequency" in class_data:
        cls.frequency = class_data["frequency"]
    if "type" in class_data:
        cls.type = ClassTypeEnum(class_data["type"])
    if "notes" in class_data:
        cls.notes = class_data["notes"]

    # Update students
    if "studentIds" in class_data:
        students = db.query(Student).filter(Student.id.in_(class_data["studentIds"])).all()
        cls.students = students

    db.commit()
    db.refresh(cls)

    return {
        "id": cls.id,
        "teacherId": cls.teacher_id,
        "instrumentId": cls.instrument_id,
        "studentIds": [s.id for s in cls.students],
        "type": cls.type.value,
        "weekday": cls.weekday,
        "startTime": cls.start_time,
        "duration": cls.duration,
        "frequency": cls.frequency,
        "status": cls.status.value,
        "notes": cls.notes
    }

@router.post("/{class_id}/attendance")
async def mark_attendance(
    class_id: str,
    attendance_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    # RBAC: Admin or the teacher of this class
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
        
    if not current_user.is_admin:
        if not current_user.teacher or current_user.teacher.id != cls.teacher_id:
            raise HTTPException(status_code=403, detail="Not authorized")

    student_id = attendance_data["studentId"]
    attended = attendance_data["attended"]
    date_str = attendance_data["date"] # YYYY-MM-DD
    
    # Convert date string to date object
    record_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    
    # Check if record already exists
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.class_id == class_id,
        AttendanceRecord.student_id == student_id,
        AttendanceRecord.date == record_date
    ).first()
    
    if existing:
        existing.attended = attended
    else:
        new_record = AttendanceRecord(
            id=f"att-{uuid.uuid4().hex[:8]}",
            class_id=class_id,
            student_id=student_id,
            date=record_date,
            attended=attended
        )
        db.add(new_record)
        
    # CREDIT DEDUCTION LOGIC
    if attended:
        # Find enrollment for this student and instrument to apply deduction
        # In a real app, this might be more complex (which enrollment?)
        # For now, we find an active enrollment for this teacher/student/instrument
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == student_id,
            Enrollment.teacher_id == cls.teacher_id,
            Enrollment.instrument_id == cls.instrument_id
        ).first()
        
        if enrollment:
            # Create a deduction transaction
            # Note: amount could be based on teacher's hourly rate and duration
            # For simplicity, 1 credit per class for now or based on duration/60
            credits_to_deduct = cls.duration / 60.0
            
            deduction = CreditTransaction(
                id=f"trx-{uuid.uuid4().hex[:8]}",
                student_id=student_id,
                enrollment_id=enrollment.id,
                credits=-credits_to_deduct,
                type=TransactionTypeEnum.DEDUCTION,
                amount=0 # Amount is 0 for deductions as it's pre-paid
            )
            db.add(deduction)

    db.commit()
    return {"status": "success"}

@router.get("/attendance")
async def get_all_attendance(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    # Only admins or relevant teachers for now
    query = db.query(AttendanceRecord)
    if not current_user.is_admin:
         if current_user.role.value == "teacher":
             query = query.join(Class).filter(Class.teacher_id == current_user.teacher.id)
         else:
             query = query.filter(AttendanceRecord.student_id == current_user.student.id)
             
    records = query.all()
    return [
        {
            "id": r.id,
            "classId": r.class_id,
            "studentId": r.student_id,
            "date": r.date.isoformat(),
            "attended": r.attended
        } for r in records
    ]
