from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Any, Optional
from datetime import datetime
import uuid
import json

from ..database import get_db
from ..models import (
    CreditTransaction, Student, Enrollment, Teacher, Instrument,
    TransactionTypeEnum, TaxTypeEnum, EnrollmentStatusEnum
)
from ..auth import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])

@router.get("/transactions")
async def get_transactions(
    type: Optional[str] = Query(None),
    student_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    query = db.query(CreditTransaction)
    
    # Filter by user role
    if not current_user.is_admin:
        if current_user.role.value == "student":
            query = query.filter(CreditTransaction.student_id == current_user.student.id)
        # Teachers might see transactions related to their enrollments? 
        # For simplicity now, let's say teachers can't see financials unless implemented
        elif current_user.role.value == "teacher":
             # Maybe filter by enrollments linked to teacher?
             # For now, restrict to admin/student own data
             raise HTTPException(status_code=403, detail="Not authorized")

    if type:
        try:
             # Match enum value
             query = query.filter(CreditTransaction.type == TransactionTypeEnum(type))
        except ValueError:
             pass # Ignore invalid type filter

    if student_id:
        if not current_user.is_admin and current_user.role.value == "student" and current_user.student.id != student_id:
             raise HTTPException(status_code=403, detail="Not authorized to view other student's transactions")
        query = query.filter(CreditTransaction.student_id == student_id)

    # Sort by date (newest first)
    query = query.order_by(desc(CreditTransaction.date))
    
    transactions = query.all()
    
    return [
        {
            "id": t.id,
            "type": t.type.value,
            "studentId": t.student_id,
            "enrollmentId": t.enrollment_id,
            "date": t.date.isoformat(),
            "credits": t.credits,
            "amount": t.amount, # Legacy field, kept for compatibility or simplified views
            "paymentMethod": t.payment_method,
            "taxType": t.tax_type.value if t.tax_type else "None",
            "taxAmount": t.tax_amount or 0,
            "subtotal": t.subtotal or 0,
            "discountAmount": t.discount_amount or 0,
            "totalAmount": t.amount, # In new model, amount is total
            "note": t.note,
            "lineItems": json.loads(t.line_items) if t.line_items else []
        } for t in transactions
    ]

@router.get("/balances")
async def get_balances(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    # Determine which enrollments to fetch
    query = db.query(Enrollment).filter(Enrollment.status == EnrollmentStatusEnum.ACTIVE)
    
    if not current_user.is_admin:
        if current_user.role.value == "student":
            query = query.filter(Enrollment.student_id == current_user.student.id)
        elif current_user.role.value == "teacher":
            query = query.filter(Enrollment.teacher_id == current_user.teacher.id)

    enrollments = query.all()
    balances = []
    
    for enrollment in enrollments:
        # Calculate balance from transactions
        transactions = db.query(CreditTransaction).filter(
            CreditTransaction.enrollment_id == enrollment.id
        ).all()
        
        current_balance = sum(t.credits for t in transactions if t.credits is not None)
        total_purchased = sum(t.credits for t in transactions if t.credits and t.credits > 0 and t.type == TransactionTypeEnum.PURCHASE)
        total_used = sum(abs(t.credits) for t in transactions if t.credits and t.credits < 0 and t.type == TransactionTypeEnum.DEDUCTION)
        
        balances.append({
            "studentId": enrollment.student_id,
            "enrollmentId": enrollment.id,
            "teacherId": enrollment.teacher_id,
            "instrumentId": enrollment.instrument_id,
            "currentBalance": current_balance,
            "totalPurchased": total_purchased,
            "totalUsed": total_used
        })
        
    return balances

@router.post("/credits/purchase")
async def purchase_credits(
    purchase_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can process payments")

    # Calculate financials
    # Expected data: studentId, enrollmentId, credits, discountAmount, discountNote, taxType, paymentMethod
    
    enrollment = db.query(Enrollment).filter(Enrollment.id == purchase_data["enrollment_id"]).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
        
    teacher = db.query(Teacher).filter(Teacher.id == enrollment.teacher_id).first()
    hourly_rate = teacher.hourly_rate if teacher else 0
    
    credits = float(purchase_data["credits"])
    price_per_credit = hourly_rate # Assuming 1 credit = 1 hour for simplicity, or we add a rate to enrollment
    
    # Calculate amounts
    subtotal = credits * price_per_credit
    discount = float(purchase_data.get("discount_amount", 0))
    tax_type_str = purchase_data.get("tax_type", "None")
    
    tax_rate = 0.13 if tax_type_str == "HST" else 0.05 if tax_type_str == "GST" else 0
    taxable_amount = max(0, subtotal - discount)
    tax_amount = taxable_amount * tax_rate
    total_amount = taxable_amount + tax_amount
    
    # Create transaction
    transaction = CreditTransaction(
        id=f"trx-{uuid.uuid4().hex[:8]}",
        student_id=purchase_data["student_id"],
        enrollment_id=purchase_data["enrollment_id"],
        type=TransactionTypeEnum.PURCHASE,
        credits=credits,
        amount=total_amount,
        subtotal=subtotal,
        discount_amount=discount,
        tax_type=TaxTypeEnum(tax_type_str),
        tax_amount=tax_amount,
        payment_method=purchase_data["payment_method"],
        note=f"Credit Purchase: {credits} credits" + (f" (Discount: {purchase_data.get('discount_note')})" if discount > 0 else "")
    )
    
    db.add(transaction)
    db.commit()
    
    return {"status": "success", "transactionId": transaction.id}

@router.post("/credits/adjustment")
async def adjust_credits(
    adjustment_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can adjust credits")
        
    credits = float(adjustment_data["credits"])
    
    transaction = CreditTransaction(
        id=f"trx-{uuid.uuid4().hex[:8]}",
        student_id=adjustment_data["student_id"],
        enrollment_id=adjustment_data["enrollment_id"],
        type=TransactionTypeEnum.ADJUSTMENT,
        credits=credits,
        amount=0, # Adjustments usually don't have monetary value in this context, or it's separate
        note=adjustment_data["note"],
        # Defaults for others
    )
    
    db.add(transaction)
    db.commit()
    return {"status": "success", "transactionId": transaction.id}
    
@router.post("/inventory")
async def inventory_payment(
    payment_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can process payments")

    # Manual calculation from frontend provided data usually, but backend verification is improved
    # Here we take the totals as calculated or verify them. 
    # For now, simplistic implementation storing the line items.
    
    line_items = payment_data.get("line_items", [])
    subtotal = sum(item["quantity"] * item["unitPrice"] for item in line_items)
    discount = float(payment_data.get("discount_amount", 0))
    tax_type_str = payment_data.get("tax_type", "None")
    
    tax_rate = 0.13 if tax_type_str == "HST" else 0.05 if tax_type_str == "GST" else 0
    taxable_amount = max(0, subtotal - discount)
    tax_amount = taxable_amount * tax_rate
    total_amount = taxable_amount + tax_amount
    
    transaction = CreditTransaction(
        id=f"trx-{uuid.uuid4().hex[:8]}",
        student_id=payment_data["customer_id"],
        type=TransactionTypeEnum.INVENTORY_PAYMENT,
        credits=0,
        amount=total_amount,
        subtotal=subtotal,
        discount_amount=discount,
        tax_type=TaxTypeEnum(tax_type_str),
        tax_amount=tax_amount,
        payment_method=payment_data["payment_method"],
        line_items=json.dumps(line_items),
        note="Inventory Payment"
    )

    db.add(transaction)
    db.commit()

    return {"status": "success", "transactionId": transaction.id}

@router.get("/transactions/{transaction_id}")
async def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    transaction = db.query(CreditTransaction).filter(CreditTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Check authorization
    if not current_user.is_admin:
        if current_user.role.value == "student" and transaction.student_id != current_user.student.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        elif current_user.role.value == "teacher":
            raise HTTPException(status_code=403, detail="Not authorized")

    return {
        "id": transaction.id,
        "type": transaction.type.value,
        "studentId": transaction.student_id,
        "enrollmentId": transaction.enrollment_id,
        "date": transaction.date.isoformat(),
        "credits": transaction.credits,
        "amount": transaction.amount,
        "paymentMethod": transaction.payment_method,
        "taxType": transaction.tax_type.value if transaction.tax_type else "None",
        "taxAmount": transaction.tax_amount or 0,
        "subtotal": transaction.subtotal or 0,
        "discountAmount": transaction.discount_amount or 0,
        "totalAmount": transaction.amount,
        "note": transaction.note,
        "lineItems": json.loads(transaction.line_items) if transaction.line_items else []
    }

@router.put("/transactions/{transaction_id}")
async def update_transaction(
    transaction_id: str,
    update_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can edit transactions")

    transaction = db.query(CreditTransaction).filter(CreditTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Cannot edit deduction (Class Attended) transactions
    if transaction.type == TransactionTypeEnum.DEDUCTION:
        raise HTTPException(status_code=400, detail="Cannot edit Class Attended transactions")

    # Update allowed fields based on type
    if "credits" in update_data:
        transaction.credits = float(update_data["credits"])
    if "note" in update_data:
        transaction.note = update_data["note"]
    if "payment_method" in update_data:
        transaction.payment_method = update_data["payment_method"]
    if "discount_amount" in update_data:
        transaction.discount_amount = float(update_data["discount_amount"])
    if "tax_type" in update_data:
        transaction.tax_type = TaxTypeEnum(update_data["tax_type"])

    # Recalculate totals for purchase/inventory_payment
    if transaction.type in [TransactionTypeEnum.PURCHASE, TransactionTypeEnum.INVENTORY_PAYMENT]:
        if transaction.type == TransactionTypeEnum.PURCHASE:
            enrollment = db.query(Enrollment).filter(Enrollment.id == transaction.enrollment_id).first()
            if enrollment:
                teacher = db.query(Teacher).filter(Teacher.id == enrollment.teacher_id).first()
                hourly_rate = teacher.hourly_rate if teacher else 0
                subtotal = transaction.credits * hourly_rate
                transaction.subtotal = subtotal

        discount = transaction.discount_amount or 0
        tax_rate = 0.13 if transaction.tax_type == TaxTypeEnum.HST else 0.05 if transaction.tax_type == TaxTypeEnum.GST else 0
        taxable_amount = max(0, (transaction.subtotal or 0) - discount)
        transaction.tax_amount = taxable_amount * tax_rate
        transaction.amount = taxable_amount + transaction.tax_amount

    db.commit()
    return {"status": "success", "transactionId": transaction.id}

@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete transactions")

    transaction = db.query(CreditTransaction).filter(CreditTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Cannot delete deduction (Class Attended) transactions
    if transaction.type == TransactionTypeEnum.DEDUCTION:
        raise HTTPException(status_code=400, detail="Cannot delete Class Attended transactions")

    db.delete(transaction)
    db.commit()
    return {"status": "success"}
