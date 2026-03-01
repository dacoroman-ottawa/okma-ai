from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Table, DateTime, Date, Enum
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class StatusEnum(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class UserRoleEnum(enum.Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

class QualificationEnum(enum.Enum):
    BACHELOR = "Bachelor of Music"
    MASTER = "Master"
    DOCTORATE = "Doctorate"
    CERTIFICATE = "Professional Certificate"
    SELF_TAUGHT = "Self-Taught Professional"

class SkillLevelEnum(enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

class ClassTypeEnum(enum.Enum):
    PRIVATE = "private"
    GROUP = "group"

class EnrollmentStatusEnum(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"

class ProductTypeEnum(enum.Enum):
    INSTRUMENT = "instrument"
    BOOK = "book"
    ACCESSORY = "accessory"
    MUSICAL_SCORE = "musical_score"
    GIFT_CARD = "gift_card"

class RentalStatusEnum(enum.Enum):
    ACTIVE = "active"
    RETURNED = "returned"
    OVERDUE = "overdue"

class TaxTypeEnum(enum.Enum):
    HST = "HST"
    GST = "GST"
    NONE = "None"

class TransactionTypeEnum(enum.Enum):
    PURCHASE = "purchase"
    DEDUCTION = "deduction"
    ADJUSTMENT = "adjustment"
    INVENTORY_PAYMENT = "inventory_payment"

class RentalPeriodEnum(enum.Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class RentalStatusEnum(enum.Enum):
    ACTIVE = "active"
    OVERDUE = "overdue"
    RETURNED = "returned"

class AttendanceStatusEnum(enum.Enum):
    SCHEDULED = "scheduled"
    CANCELLED = "cancelled"
    MAKEUP = "makeup"
    ABSENT = "absent"
    PRESENT = "present"

# Association table for Group Classes
class_students = Table(
    'class_students',
    Base.metadata,
    Column('class_id', String, ForeignKey('classes.id'), primary_key=True),
    Column('student_id', String, ForeignKey('students.id'), primary_key=True),
    extend_existing=True
)

teacher_instruments = Table(
    'teacher_instruments',
    Base.metadata,
    Column('teacher_id', String, ForeignKey('teachers.id'), primary_key=True),
    Column('instrument_id', String, ForeignKey('instruments.id'), primary_key=True),
    extend_existing=True
)

class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("app_users.id"), unique=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    primary_contact = Column(String)
    address = Column(String)
    date_of_birth = Column(Date)
    biography = Column(String)
    specialization = Column(String)
    qualification = Column(Enum(QualificationEnum))
    date_of_enrollment = Column(Date)
    social_insurance_number = Column(String)
    hourly_rate = Column(Float)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("AppUser", back_populates="teacher")
    instruments = relationship("Instrument", secondary=teacher_instruments, back_populates="teachers")
    enrollments = relationship("Enrollment", back_populates="teacher")
    classes = relationship("Class", back_populates="teacher")
    availability = relationship("AvailabilitySlot", back_populates="teacher")

class Student(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("app_users.id"), unique=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    primary_contact = Column(String)
    address = Column(String)
    date_of_birth = Column(Date)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("AppUser", back_populates="student")
    skill_levels = relationship("SkillLevel", back_populates="student")
    enrollments = relationship("Enrollment", back_populates="student")
    classes = relationship("Class", secondary=class_students, back_populates="students")
    transactions = relationship("CreditTransaction", back_populates="student")
    availability = relationship("AvailabilitySlot", back_populates="student")

class Instrument(Base):
    __tablename__ = "instruments"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)

    teachers = relationship("Teacher", secondary=teacher_instruments, back_populates="instruments")

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"))
    teacher_id = Column(String, ForeignKey("teachers.id"))
    instrument_id = Column(String, ForeignKey("instruments.id"))
    start_date = Column(Date)
    status = Column(Enum(EnrollmentStatusEnum), default=EnrollmentStatusEnum.ACTIVE)

    student = relationship("Student", back_populates="enrollments")
    teacher = relationship("Teacher", back_populates="enrollments")
    classes = relationship("Class", back_populates="enrollment")

class Class(Base):
    __tablename__ = "classes"
    id = Column(String, primary_key=True)
    teacher_id = Column(String, ForeignKey("teachers.id"))
    enrollment_id = Column(String, ForeignKey("enrollments.id"))
    instrument_id = Column(String, ForeignKey("instruments.id"))
    weekday = Column(String)
    start_time = Column(String)
    duration = Column(Integer)
    type = Column(Enum(ClassTypeEnum))
    frequency = Column(Integer, default=1)
    notes = Column(String)

    teacher = relationship("Teacher", back_populates="classes")
    students = relationship("Student", secondary=class_students, back_populates="classes")
    enrollment = relationship("Enrollment", back_populates="classes")

class Product(Base):
    __table_args__ = {'extend_existing': True}
    __tablename__ = "products"
    id = Column(String, primary_key=True)
    type = Column(Enum(ProductTypeEnum), nullable=False)
    name = Column(String, nullable=False)
    model = Column(String)
    serial_number = Column(String)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    cost = Column(Float)
    selling_price = Column(Float)
    rental_price = Column(Float)
    stock_quantity = Column(Integer, default=0)
    reorder_level = Column(Integer, default=5)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    supplier = relationship("Supplier", back_populates="products")

    rentals = relationship("Rental", back_populates="product")
    sales = relationship("Sale", back_populates="product")

class Supplier(Base):
    __tablename__ = "suppliers"
    __table_args__ = {'extend_existing': True}
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    contact_person = Column(String)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    products = relationship("Product", back_populates="supplier")

class Customer(Base):
    __tablename__ = "customers"
    __table_args__ = {'extend_existing': True}
    id = Column(String, primary_key=True) 
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    rentals = relationship("Rental", back_populates="customer")
    sales = relationship("Sale", back_populates="customer")

class Rental(Base):
    __tablename__ = "rentals"
    __table_args__ = {'extend_existing': True}
    id = Column(String, primary_key=True)
    product_id = Column(String, ForeignKey("products.id"))
    customer_id = Column(String, ForeignKey("customers.id"))
    rental_period = Column(Enum(RentalPeriodEnum))
    start_date = Column(Date)
    due_date = Column(Date)
    return_date = Column(Date)
    deposit = Column(Float)
    rental_fee = Column(Float)
    late_fee = Column(Float, default=0)
    status = Column(Enum(RentalStatusEnum), default=RentalStatusEnum.ACTIVE)
    condition_notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="rentals")
    customer = relationship("Customer", back_populates="rentals")

class Sale(Base):
    __tablename__ = "sales"
    __table_args__ = {'extend_existing': True}
    id = Column(String, primary_key=True)
    product_id = Column(String, ForeignKey("products.id"))
    customer_id = Column(String, ForeignKey("customers.id"))
    date = Column(Date)
    quantity = Column(Integer)
    unit_price = Column(Float)
    total_amount = Column(Float)
    payment_method = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="sales")
    customer = relationship("Customer", back_populates="sales")

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"))
    enrollment_id = Column(String, ForeignKey("enrollments.id"))
    date = Column(DateTime, server_default=func.now())
    credits = Column(Float)
    amount = Column(Float)
    type = Column(Enum(TransactionTypeEnum))
    payment_method = Column(String)
    tax_type = Column(Enum(TaxTypeEnum), default=TaxTypeEnum.NONE)
    tax_amount = Column(Float, default=0.0)
    subtotal = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    note = Column(String)
    line_items = Column(String) # JSON string for inventory items

    student = relationship("Student", back_populates="transactions")

class AppUser(Base):
    __tablename__ = "app_users"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRoleEnum), default=UserRoleEnum.STUDENT)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login_at = Column(DateTime(timezone=True))

    teacher = relationship("Teacher", back_populates="user", uselist=False)
    student = relationship("Student", back_populates="user", uselist=False)

class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"
    id = Column(Integer, primary_key=True)
    teacher_id = Column(String, ForeignKey("teachers.id"), nullable=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=True)
    day = Column(String, nullable=False) # e.g., "Monday"
    start_time = Column(String, nullable=False) # e.g., "09:00"
    end_time = Column(String, nullable=False) # e.g., "17:00"

    teacher = relationship("Teacher", back_populates="availability")
    student = relationship("Student", back_populates="availability")

class SkillLevel(Base):
    __tablename__ = "skill_levels"
    id = Column(Integer, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"))
    instrument_id = Column(String, ForeignKey("instruments.id"))
    level = Column(Enum(SkillLevelEnum))

    student = relationship("Student", back_populates="skill_levels")
    instrument = relationship("Instrument")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(String, primary_key=True)
    class_id = Column(String, ForeignKey("classes.id"))
    student_id = Column(String, ForeignKey("students.id"))
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatusEnum), default=AttendanceStatusEnum.SCHEDULED)
    time = Column(String, nullable=True)
    remarks = Column(String, nullable=True)
    credits = Column(Integer, default=0)

    class_ = relationship("Class")
    student = relationship("Student")

# ============================================================================= 
# Inventory Models
# =============================================================================

