
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import uuid
from datetime import date, datetime

from backend.main import app
from backend.database import get_db, Base
from backend.models import (
    Teacher, Student, Instrument, Enrollment, UserRoleEnum, 
    TransactionTypeEnum, TaxTypeEnum, CreditTransaction
)
from backend.auth import get_current_user

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
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
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# Mock User
class MockUser:
    def __init__(self, id, role=UserRoleEnum.ADMIN, is_admin=True, teacher=None, student=None):
        self.id = id
        self.role = role
        self.is_admin = is_admin
        self.teacher = teacher
        self.student = student

@pytest.fixture
def admin_user():
    return MockUser(id="admin-1", role=UserRoleEnum.ADMIN, is_admin=True)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    yield db
    db.close()

@pytest.fixture
def sample_data(db_session):
    # Create Teacher
    teacher = Teacher(
        id="teacher-1", 
        name="John Doe", 
        email="john@example.com",
        hourly_rate=60.0
    )
    db_session.add(teacher)
    
    # Create Student
    student = Student(
        id="student-1", 
        name="Alice Smith", 
        email="alice@example.com"
    )
    db_session.add(student)
    
    # Create Instrument
    instrument = Instrument(id="inst-1", name="Piano")
    db_session.add(instrument)
    
    # Create Enrollment
    enrollment = Enrollment(
        id="enroll-1",
        student_id=student.id,
        teacher_id=teacher.id,
        instrument_id=instrument.id,
        start_date=date.today()
    )
    db_session.add(enrollment)
    db_session.commit()
    
    return {
        "teacher": teacher,
        "student": student,
        "instrument": instrument,
        "enrollment": enrollment
    }

def test_purchase_credits(admin_user, sample_data):
    app.dependency_overrides[get_current_user] = lambda: admin_user
    
    response = client.post("/payments/credits/purchase", json={
        "studentId": sample_data["student"].id,
        "enrollmentId": sample_data["enrollment"].id,
        "credits": 5,
        "discountAmount": 0,
        "taxType": "HST",
        "paymentMethod": "Credit Card"
    })
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    
    # Verify transaction in DB
    with TestingSessionLocal() as db:
        trx = db.query(CreditTransaction).first()
        assert trx is not None
        assert trx.type == TransactionTypeEnum.PURCHASE
        assert trx.credits == 5.0
        assert trx.student_id == sample_data["student"].id
        
        # Verify financial calculations
        # 5 credits * $60/hr = $300 subtotal
        # Tax (HST 13%) = $39
        # Total = $339
        assert trx.subtotal == 300.0
        assert trx.tax_amount == 39.0
        assert trx.amount == 339.0

def test_credit_adjustment(admin_user, sample_data):
    app.dependency_overrides[get_current_user] = lambda: admin_user
    
    response = client.post("/payments/credits/adjustment", json={
        "studentId": sample_data["student"].id,
        "enrollmentId": sample_data["enrollment"].id,
        "credits": -1,
        "note": "Correction"
    })
    
    assert response.status_code == 200
    
    with TestingSessionLocal() as db:
        trx = db.query(CreditTransaction).first()
        assert trx.type == TransactionTypeEnum.ADJUSTMENT
        assert trx.credits == -1.0

def test_get_balances(admin_user, sample_data):
    app.dependency_overrides[get_current_user] = lambda: admin_user
    
    # Add some transactions
    client.post("/payments/credits/purchase", json={
        "studentId": sample_data["student"].id,
        "enrollmentId": sample_data["enrollment"].id,
        "credits": 10,
        "taxType": "None",
        "paymentMethod": "Cash"
    })
    
    client.post("/payments/credits/adjustment", json={
        "studentId": sample_data["student"].id,
        "enrollmentId": sample_data["enrollment"].id,
        "credits": -2,
        "note": "Used"
    })
    
    response = client.get("/payments/balances")
    assert response.status_code == 200
    balances = response.json()
    
    assert len(balances) == 1
    balance = balances[0]
    assert balance["studentId"] == sample_data["student"].id
    assert balance["currentBalance"] == 8.0 # 10 - 2
    assert balance["totalPurchased"] == 10.0
    # Adjustment with negative credits technically counts towards used in my logic?
    # No, my logic was:
    # total_used = sum(abs(t.credits) for t in transactions if t.credits and t.credits < 0 and t.type == TransactionTypeEnum.DEDUCTION)
    # Adjustment is NOT Deduction. So total_used should be 0 unless I check ADJUSTMENT too or change logic.
    # Let's check generated code logic in get_balances:
    # total_used = sum(abs(t.credits) for t in transactions if t.credits and t.credits < 0 and t.type == TransactionTypeEnum.DEDUCTION)
    # So adjustment won't show in total_used. That implies only class attendance counts as usage, which is fair.

def test_inventory_payment(admin_user, sample_data):
    app.dependency_overrides[get_current_user] = lambda: admin_user
    
    line_item = {
        "description": "Guitar Strings",
        "quantity": 2,
        "unitPrice": 15.0
    }
    
    response = client.post("/payments/inventory", json={
        "customerId": sample_data["student"].id,
        "paymentMethod": "Debit",
        "taxType": "GST",
        "lineItems": [line_item]
    })
    
    assert response.status_code == 200
    
    with TestingSessionLocal() as db:
        trx = db.query(CreditTransaction).filter(CreditTransaction.type == TransactionTypeEnum.INVENTORY_PAYMENT).first()
        assert trx is not None
        assert trx.credits == 0
        # 2 * 15 = 30 subtotal. GST 5% = 1.50. Total 31.50
        assert trx.subtotal == 30.0
        assert trx.tax_amount == 1.5
        assert trx.amount == 31.5
