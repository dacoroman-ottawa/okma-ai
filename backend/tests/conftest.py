"""
Pytest configuration file for backend tests.

This file ensures all models are imported and registered with Base.metadata
before any tests run, so that Base.metadata.create_all() creates all tables.
It also handles test isolation by resetting app state between test modules.
"""
import pytest

# Import all models to ensure they're registered with Base.metadata
from backend.models import (
    Base,
    # Enums
    StatusEnum,
    UserRoleEnum,
    QualificationEnum,
    SkillLevelEnum,
    ClassTypeEnum,
    EnrollmentStatusEnum,
    ProductTypeEnum,
    RentalStatusEnum,
    TaxTypeEnum,
    TransactionTypeEnum,
    RentalPeriodEnum,
    AttendanceStatusEnum,
    # Core models
    Teacher,
    Student,
    Instrument,
    Enrollment,
    Class,
    # Inventory models
    Product,
    Supplier,
    Customer,
    Rental,
    Sale,
    # Payment models
    CreditTransaction,
    # User/Auth models
    AppUser,
    # Supporting models
    AvailabilitySlot,
    SkillLevel,
    AttendanceRecord,
)

from backend.main import app


@pytest.fixture(autouse=True, scope="function")
def reset_app_overrides():
    """Reset app dependency overrides after each test to prevent state pollution."""
    # Store original overrides
    original_overrides = dict(app.dependency_overrides)
    yield
    # Restore original state
    app.dependency_overrides.clear()
    app.dependency_overrides.update(original_overrides)


# This ensures all models are loaded when pytest collects tests
__all__ = [
    'Base',
    'Teacher',
    'Student',
    'Instrument',
    'Enrollment',
    'Class',
    'Product',
    'Supplier',
    'Customer',
    'Rental',
    'Sale',
    'CreditTransaction',
    'AppUser',
    'AvailabilitySlot',
    'SkillLevel',
    'AttendanceRecord',
]
