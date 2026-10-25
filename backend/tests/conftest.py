"""
Pytest configuration file for backend tests.

This file ensures all models are imported and registered with Base.metadata
before any tests run, so that Base.metadata.create_all() creates all tables.
It also handles test isolation by resetting app state between test modules.
"""
import pytest
from unittest.mock import patch, AsyncMock

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


def pytest_configure(config):
    config.addinivalue_line(
        "markers",
        "real_email_service: exercise the real email service instead of the "
        "autouse mocks (the test must intercept SMTP itself)",
    )


@pytest.fixture(autouse=True, scope="function")
def reset_app_overrides():
    """Reset app dependency overrides after each test to prevent state pollution."""
    # Store original overrides
    original_overrides = dict(app.dependency_overrides)
    yield
    # Restore original state
    app.dependency_overrides.clear()
    app.dependency_overrides.update(original_overrides)


@pytest.fixture(autouse=True, scope="function")
def mock_email_sending(request):
    """Mock email sending functions to prevent actual emails during tests.

    Tests marked with ``@pytest.mark.real_email_service`` opt out, so they can
    exercise the email service itself. Those tests are responsible for
    intercepting SMTP themselves.
    """
    if request.node.get_closest_marker("real_email_service"):
        yield None
        return

    # ``_send_email`` is the single chokepoint: every sender funnels through it
    # and it is the only thing that reaches SMTP, so patching it here blocks
    # all delivery. Do NOT also patch send_welcome_email /
    # send_password_reset_email on the service module - the routes bind those
    # names at import (``from ..services.email import ...``), so such a patch
    # is inert, and patching them on the route modules instead would short
    # out the chokepoint that individual tests override to simulate failures.
    with patch(
        "backend.services.email._send_email",
        new_callable=AsyncMock,
        return_value=True
    ) as mock_send:
        yield {"_send_email": mock_send}


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
