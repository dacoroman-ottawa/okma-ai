from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from datetime import date, datetime, timedelta
import uuid

from ..database import get_db
from ..models import (
    Class, AttendanceRecord, Student, Teacher, Instrument, Enrollment,
    ClassTypeEnum, CreditTransaction, TransactionTypeEnum,
    AttendanceStatusEnum
)
from ..auth import get_current_user

router = APIRouter(prefix="/classes", tags=["classes"])


def get_credits_for_status(status: AttendanceStatusEnum) -> int:
    """Return credits based on attendance status: -1 for present, 0 for all others."""
    return -1 if status == AttendanceStatusEnum.PRESENT else 0

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
        notes=class_data.get("notes")
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
    date_str = attendance_data["date"] # YYYY-MM-DD

    # Support both old format (attended: boolean) and new format (status: string)
    if "status" in attendance_data:
        status = AttendanceStatusEnum(attendance_data["status"])
    else:
        # Legacy support: convert attended boolean to status
        attended = attendance_data.get("attended", False)
        status = AttendanceStatusEnum.PRESENT if attended else AttendanceStatusEnum.ABSENT

    time_str = attendance_data.get("time")
    remarks = attendance_data.get("remarks")

    # Convert date string to date object
    record_date = datetime.strptime(date_str, "%Y-%m-%d").date()

    # Check if record already exists
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.class_id == class_id,
        AttendanceRecord.student_id == student_id,
        AttendanceRecord.date == record_date
    ).first()

    was_present = False
    if existing:
        was_present = existing.status == AttendanceStatusEnum.PRESENT
        existing.status = status
        existing.credits = get_credits_for_status(status)
        if time_str is not None:
            existing.time = time_str
        if remarks is not None:
            existing.remarks = remarks
    else:
        new_record = AttendanceRecord(
            id=f"att-{uuid.uuid4().hex[:8]}",
            class_id=class_id,
            student_id=student_id,
            date=record_date,
            status=status,
            time=time_str or cls.start_time,
            remarks=remarks,
            credits=get_credits_for_status(status)
        )
        db.add(new_record)

    # CREDIT DEDUCTION LOGIC - only when changing TO present
    if status == AttendanceStatusEnum.PRESENT and not was_present:
        # Find enrollment for this student and instrument to apply deduction
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == student_id,
            Enrollment.teacher_id == cls.teacher_id,
            Enrollment.instrument_id == cls.instrument_id
        ).first()

        if enrollment:
            # Create a deduction transaction
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
    week_start: str = None,
    week_end: str = None,
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

    # Filter by date range if provided
    if week_start:
        start_date = datetime.strptime(week_start, "%Y-%m-%d").date()
        query = query.filter(AttendanceRecord.date >= start_date)
    if week_end:
        end_date = datetime.strptime(week_end, "%Y-%m-%d").date()
        query = query.filter(AttendanceRecord.date <= end_date)

    records = query.all()
    return [
        {
            "id": r.id,
            "classId": r.class_id,
            "studentId": r.student_id,
            "date": r.date.isoformat(),
            "status": r.status.value if r.status else "scheduled",
            "time": r.time,
            "remarks": r.remarks,
            "credits": r.credits if r.credits is not None else 0
        } for r in records
    ]


@router.post("/attendance/generate-week")
async def generate_week_attendance(
    data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Generate SCHEDULED attendance entries for all classes in a given week."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    week_start_str = data["weekStart"]  # YYYY-MM-DD (Monday)
    week_start = datetime.strptime(week_start_str, "%Y-%m-%d").date()

    # Map weekday names to offsets from Monday
    weekday_map = {
        "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3,
        "Friday": 4, "Saturday": 5, "Sunday": 6
    }

    # Get all classes
    classes = db.query(Class).all()
    created_count = 0

    for cls in classes:
        if cls.weekday not in weekday_map:
            continue

        # Calculate the actual date for this class in the given week
        day_offset = weekday_map[cls.weekday]
        class_date = week_start + timedelta(days=day_offset)

        # Create an entry for each student in the class
        for student in cls.students:
            # Check if record already exists
            existing = db.query(AttendanceRecord).filter(
                AttendanceRecord.class_id == cls.id,
                AttendanceRecord.student_id == student.id,
                AttendanceRecord.date == class_date
            ).first()

            if not existing:
                new_record = AttendanceRecord(
                    id=f"att-{uuid.uuid4().hex[:8]}",
                    class_id=cls.id,
                    student_id=student.id,
                    date=class_date,
                    status=AttendanceStatusEnum.SCHEDULED,
                    time=cls.start_time,
                    credits=0
                )
                db.add(new_record)
                created_count += 1

    db.commit()
    return {"status": "success", "created": created_count}


@router.post("/attendance")
async def create_attendance(
    data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Create a standalone attendance entry (e.g., for make-up classes)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    class_id = data["classId"]
    student_id = data["studentId"]
    date_str = data["date"]
    time_str = data.get("time")
    status_str = data.get("status", "scheduled")
    remarks = data.get("remarks")

    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    record_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    status = AttendanceStatusEnum(status_str)

    # Check if record already exists
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.class_id == class_id,
        AttendanceRecord.student_id == student_id,
        AttendanceRecord.date == record_date
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Attendance record already exists for this date")

    new_record = AttendanceRecord(
        id=f"att-{uuid.uuid4().hex[:8]}",
        class_id=class_id,
        student_id=student_id,
        date=record_date,
        status=status,
        time=time_str or cls.start_time,
        remarks=remarks,
        credits=get_credits_for_status(status)
    )
    db.add(new_record)

    # Credit deduction if status is present
    if status == AttendanceStatusEnum.PRESENT:
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == student_id,
            Enrollment.teacher_id == cls.teacher_id,
            Enrollment.instrument_id == cls.instrument_id
        ).first()

        if enrollment:
            credits_to_deduct = cls.duration / 60.0
            deduction = CreditTransaction(
                id=f"trx-{uuid.uuid4().hex[:8]}",
                student_id=student_id,
                enrollment_id=enrollment.id,
                credits=-credits_to_deduct,
                type=TransactionTypeEnum.DEDUCTION,
                amount=0
            )
            db.add(deduction)

    db.commit()
    db.refresh(new_record)

    return {
        "id": new_record.id,
        "classId": new_record.class_id,
        "studentId": new_record.student_id,
        "date": new_record.date.isoformat(),
        "status": new_record.status.value,
        "time": new_record.time,
        "remarks": new_record.remarks,
        "credits": new_record.credits
    }


@router.put("/attendance/{attendance_id}")
async def update_attendance(
    attendance_id: str,
    data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Update a single attendance record by ID."""
    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    cls = db.query(Class).filter(Class.id == record.class_id).first()

    # RBAC: Admin or the teacher of this class
    if not current_user.is_admin:
        if not current_user.teacher or current_user.teacher.id != cls.teacher_id:
            raise HTTPException(status_code=403, detail="Not authorized")

    was_present = record.status == AttendanceStatusEnum.PRESENT

    # Update fields
    if "date" in data:
        record.date = datetime.strptime(data["date"], "%Y-%m-%d").date()
    if "time" in data:
        record.time = data["time"]
    if "status" in data:
        record.status = AttendanceStatusEnum(data["status"])
        record.credits = get_credits_for_status(record.status)
    if "remarks" in data:
        record.remarks = data["remarks"]

    # Credit deduction if changing to present
    if record.status == AttendanceStatusEnum.PRESENT and not was_present:
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == record.student_id,
            Enrollment.teacher_id == cls.teacher_id,
            Enrollment.instrument_id == cls.instrument_id
        ).first()

        if enrollment:
            credits_to_deduct = cls.duration / 60.0
            deduction = CreditTransaction(
                id=f"trx-{uuid.uuid4().hex[:8]}",
                student_id=record.student_id,
                enrollment_id=enrollment.id,
                credits=-credits_to_deduct,
                type=TransactionTypeEnum.DEDUCTION,
                amount=0
            )
            db.add(deduction)

    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "classId": record.class_id,
        "studentId": record.student_id,
        "date": record.date.isoformat(),
        "status": record.status.value,
        "time": record.time,
        "remarks": record.remarks,
        "credits": record.credits
    }


@router.delete("/attendance/{attendance_id}")
async def delete_attendance(
    attendance_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Delete a single attendance record by ID."""
    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    cls = db.query(Class).filter(Class.id == record.class_id).first()

    # RBAC: Admin or the teacher of this class
    if not current_user.is_admin:
        if not current_user.teacher or current_user.teacher.id != cls.teacher_id:
            raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(record)
    db.commit()

    return {"status": "deleted", "id": attendance_id}
