from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any
from datetime import date, timedelta
import uuid

from ..database import get_db
from ..models import (
    Class, Student, Teacher, Instrument, Enrollment,
    Product, Rental, CreditTransaction,
    ClassStatusEnum, EnrollmentStatusEnum, RentalStatusEnum, TransactionTypeEnum
)
from ..auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

WEEKDAY_MAP = {
    0: "Monday",
    1: "Tuesday",
    2: "Wednesday",
    3: "Thursday",
    4: "Friday",
    5: "Saturday",
    6: "Sunday"
}


@router.get("/summary")
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """
    Get dashboard summary with metrics, today's classes, upcoming classes,
    credit alerts, and inventory alerts.
    """
    today = date.today()
    today_weekday = WEEKDAY_MAP[today.weekday()]

    # ==========================================================================
    # Metrics
    # ==========================================================================

    # Classes today - count classes scheduled for today's weekday
    classes_today = db.query(Class).filter(
        Class.weekday == today_weekday,
        Class.status == ClassStatusEnum.SCHEDULED
    ).count()

    # Students enrolled - count active enrollments (unique students)
    students_enrolled = db.query(func.count(func.distinct(Enrollment.student_id))).filter(
        Enrollment.status == EnrollmentStatusEnum.ACTIVE
    ).scalar() or 0

    # Active rentals
    active_rentals = db.query(Rental).filter(
        Rental.status.in_([RentalStatusEnum.ACTIVE, RentalStatusEnum.OVERDUE])
    ).count()

    # Low stock count
    low_stock_count = db.query(Product).filter(
        Product.stock_quantity <= Product.reorder_level,
        Product.active == True
    ).count()

    # ==========================================================================
    # Today's Classes
    # ==========================================================================

    todays_classes_query = db.query(Class).filter(
        Class.weekday == today_weekday,
        Class.status == ClassStatusEnum.SCHEDULED
    ).all()

    todays_classes = []
    for cls in todays_classes_query:
        teacher = db.query(Teacher).filter(Teacher.id == cls.teacher_id).first()
        instrument = db.query(Instrument).filter(Instrument.id == cls.instrument_id).first()
        student_names = [s.name for s in cls.students]

        todays_classes.append({
            "id": cls.id,
            "time": cls.start_time,
            "duration": cls.duration,
            "teacher_name": teacher.name if teacher else "Unknown",
            "student_names": student_names,
            "instrument_name": instrument.name if instrument else "Unknown",
            "type": cls.type.value if cls.type else "private"
        })

    # Sort by time
    todays_classes.sort(key=lambda x: x["time"])

    # ==========================================================================
    # Upcoming Classes (next 7 days excluding today)
    # ==========================================================================

    upcoming_classes = []
    for day_offset in range(1, 8):  # Next 7 days
        future_date = today + timedelta(days=day_offset)
        future_weekday = WEEKDAY_MAP[future_date.weekday()]

        classes_on_day = db.query(Class).filter(
            Class.weekday == future_weekday,
            Class.status == ClassStatusEnum.SCHEDULED
        ).all()

        for cls in classes_on_day:
            teacher = db.query(Teacher).filter(Teacher.id == cls.teacher_id).first()
            instrument = db.query(Instrument).filter(Instrument.id == cls.instrument_id).first()
            student_names = [s.name for s in cls.students]

            upcoming_classes.append({
                "id": cls.id,
                "date": future_date.isoformat(),
                "time": cls.start_time,
                "duration": cls.duration,
                "teacher_name": teacher.name if teacher else "Unknown",
                "student_names": student_names,
                "instrument_name": instrument.name if instrument else "Unknown",
                "type": cls.type.value if cls.type else "private"
            })

    # Sort by date and time, limit to 7
    upcoming_classes.sort(key=lambda x: (x["date"], x["time"]))
    upcoming_classes = upcoming_classes[:7]

    # ==========================================================================
    # Credit Alerts (students with balance <= 2 credits)
    # ==========================================================================

    credit_alerts = []
    active_enrollments = db.query(Enrollment).filter(
        Enrollment.status == EnrollmentStatusEnum.ACTIVE
    ).all()

    for enrollment in active_enrollments:
        # Calculate balance for this enrollment
        transactions = db.query(CreditTransaction).filter(
            CreditTransaction.enrollment_id == enrollment.id
        ).all()

        current_balance = sum(t.credits for t in transactions if t.credits is not None)

        if current_balance <= 2:
            student = db.query(Student).filter(Student.id == enrollment.student_id).first()
            teacher = db.query(Teacher).filter(Teacher.id == enrollment.teacher_id).first()
            instrument = db.query(Instrument).filter(Instrument.id == enrollment.instrument_id).first()

            # Determine severity
            if current_balance <= 0:
                severity = "critical"
            elif current_balance <= 1:
                severity = "warning"
            else:
                severity = "low"

            credit_alerts.append({
                "id": f"alert-{enrollment.id}",
                "student_id": enrollment.student_id,
                "student_name": student.name if student else "Unknown",
                "instrument_name": instrument.name if instrument else "Unknown",
                "teacher_name": teacher.name if teacher else "Unknown",
                "current_balance": current_balance,
                "severity": severity
            })

    # Sort by severity (critical first)
    severity_order = {"critical": 0, "warning": 1, "low": 2}
    credit_alerts.sort(key=lambda x: severity_order.get(x["severity"], 3))

    # ==========================================================================
    # Inventory Alerts (low stock + overdue rentals)
    # ==========================================================================

    inventory_alerts = []

    # Low stock products
    low_stock_products = db.query(Product).filter(
        Product.stock_quantity <= Product.reorder_level,
        Product.active == True
    ).all()

    for product in low_stock_products:
        # Determine severity based on how low stock is
        if product.stock_quantity == 0:
            severity = "critical"
        elif product.stock_quantity <= product.reorder_level // 2:
            severity = "warning"
        else:
            severity = "low"

        inventory_alerts.append({
            "id": f"low-stock-{product.id}",
            "type": "low_stock",
            "product_id": product.id,
            "product_name": product.name,
            "current_stock": product.stock_quantity,
            "reorder_level": product.reorder_level,
            "severity": severity
        })

    # Overdue rentals
    overdue_rentals = db.query(Rental).filter(
        Rental.status.in_([RentalStatusEnum.ACTIVE, RentalStatusEnum.OVERDUE]),
        Rental.due_date < today
    ).all()

    for rental in overdue_rentals:
        product = db.query(Product).filter(Product.id == rental.product_id).first()
        customer = rental.customer
        days_overdue = (today - rental.due_date).days

        # Update rental status to OVERDUE if not already
        if rental.status != RentalStatusEnum.OVERDUE:
            rental.status = RentalStatusEnum.OVERDUE
            db.commit()

        # Determine severity based on days overdue
        if days_overdue >= 14:
            severity = "critical"
        elif days_overdue >= 7:
            severity = "warning"
        else:
            severity = "low"

        inventory_alerts.append({
            "id": f"overdue-{rental.id}",
            "type": "overdue_rental",
            "rental_id": rental.id,
            "product_name": product.name if product else "Unknown",
            "customer_name": customer.name if customer else "Unknown",
            "days_overdue": days_overdue,
            "severity": severity
        })

    # Sort by severity
    inventory_alerts.sort(key=lambda x: severity_order.get(x["severity"], 3))

    return {
        "metrics": {
            "classes_today": classes_today,
            "students_enrolled": students_enrolled,
            "active_rentals": active_rentals,
            "low_stock_count": low_stock_count
        },
        "todays_classes": todays_classes,
        "upcoming_classes": upcoming_classes,
        "credit_alerts": credit_alerts,
        "inventory_alerts": inventory_alerts
    }
