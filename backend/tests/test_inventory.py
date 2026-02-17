import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date, timedelta
import uuid

from backend.main import app
from backend.database import get_db
from backend.models import Base, AppUser, Supplier, Customer, Product, Rental, Sale
from backend.models import ProductTypeEnum, RentalPeriodEnum, RentalStatusEnum
from backend.auth import get_password_hash, get_current_user

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_inventory.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Mock User
class MockUser:
    def __init__(self, id, role="admin", is_admin=True):
        self.id = id
        self.role = role
        self.is_admin = is_admin

@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def admin_user():
    """Create a mock admin user"""
    mock_user = MockUser(id="admin-1", is_admin=True)
    
    def override_get_current_user():
        return mock_user
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield mock_user
    app.dependency_overrides.pop(get_current_user, None)

@pytest.fixture
def regular_user():
    """Create a mock regular (non-admin) user"""
    mock_user = MockUser(id="user-1", is_admin=False)
    
    def override_get_current_user():
        return mock_user
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield mock_user
    app.dependency_overrides.pop(get_current_user, None)

@pytest.fixture
def test_supplier(client, admin_user):
    """Create a test supplier"""
    response = client.post(
        "/inventory/suppliers",
        json={
            "id": f"sup-{uuid.uuid4().hex[:8]}",
            "name": "Test Supplier",
            "contact_person": "John Doe",
            "email": "john@supplier.com",
            "phone": "613-555-0001",
            "address": "123 Main St",
            "active": True
        }
    )
    return response.json()

@pytest.fixture
def test_customer(client, admin_user):
    """Create a test customer"""
    response = client.post(
        "/inventory/customers",
        json={
            "id": f"cust-{uuid.uuid4().hex[:8]}",
            "name": "Test Customer",
            "email": "customer@test.com",
            "phone": "613-555-0002",
            "address": "456 Oak Ave",
            "notes": "Test notes"
        }
    )
    return response.json()

@pytest.fixture
def test_product(client, admin_user, test_supplier):
    """Create a test product"""
    response = client.post(
        "/inventory/products",
        json={
            "id": f"prod-{uuid.uuid4().hex[:8]}",
            "type": "instrument",
            "name": "Test Violin",
            "model": "Student Model",
            "serial_number": None,
            "supplier_id": test_supplier["id"],
            "cost": 180.00,
            "selling_price": 299.00,
            "rental_price": 45.00,
            "stock_quantity": 5,
            "reorder_level": 2,
            "active": True
        }
    )
    return response.json()

# =============================================================================
# Supplier Tests
# =============================================================================

def test_create_supplier(client, admin_user):
    """Test creating a new supplier"""
    response = client.post(
        "/inventory/suppliers",
        json={
            "name": "Music Store Inc",
            "contact_person": "Jane Smith",
            "email": "jane@musicstore.com",
            "phone": "613-555-1234",
            "address": "789 Elm St, Ottawa, ON",
            "active": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Music Store Inc"
    assert "id" in data

def test_list_suppliers(client, admin_user, test_supplier):
    """Test listing all suppliers"""
    response = client.get(
        "/inventory/suppliers",
        headers={"Authorization": f"Bearer {admin_user}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(s["id"] == test_supplier["id"] for s in data)

def test_update_supplier(client, admin_user, test_supplier):
    """Test updating a supplier"""
    response = client.put(
        f"/inventory/suppliers/{test_supplier['id']}",
        json={
            "name": "Updated Supplier Name",
            "contact_person": "New Contact",
            "email": "new@email.com",
            "phone": "613-555-9999",
            "address": "New Address",
            "active": False
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Supplier Name"
    assert data["active"] is False

def test_delete_supplier(client, admin_user, test_supplier):
    """Test deleting a supplier"""
    response = client.delete(
        f"/inventory/suppliers/{test_supplier['id']}",
        headers={"Authorization": f"Bearer {admin_user}"}
    )
    assert response.status_code == 200
    
    # Verify deletion
    response = client.get(
        "/inventory/suppliers",
        headers={"Authorization": f"Bearer {admin_user}"}
    )
    data = response.json()
    assert not any(s["id"] == test_supplier["id"] for s in data)

# =============================================================================
# Customer Tests
# =============================================================================

def test_create_customer(client, admin_user):
    """Test creating a new customer"""
    response = client.post(
        "/inventory/customers",
        json={
            "name": "Alice Johnson",
            "email": "alice@email.com",
            "phone": "613-555-5678",
            "address": "321 Pine Rd, Kanata, ON",
            "notes": None
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alice Johnson"
    assert "id" in data

def test_list_customers(client, admin_user, test_customer):
    """Test listing all customers"""
    response = client.get(
        "/inventory/customers",
        headers={"Authorization": f"Bearer {admin_user}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_update_customer(client, admin_user, test_customer):
    """Test updating a customer"""
    response = client.put(
        f"/inventory/customers/{test_customer['id']}",
        json={
            "name": "Updated Customer",
            "email": "updated@email.com",
            "phone": "613-555-0000",
            "address": "Updated Address",
            "notes": "Updated notes"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Customer"

def test_delete_customer(client, admin_user, test_customer):
    """Test deleting a customer"""
    response = client.delete(
        f"/inventory/customers/{test_customer['id']}",
        headers={"Authorization": f"Bearer {admin_user}"}
    )
    assert response.status_code == 200

# =============================================================================
# Product Tests
# =============================================================================

def test_create_product(client, admin_user, test_supplier):
    """Test creating a new product"""
    response = client.post(
        "/inventory/products",
        json={
            "type": "book",
            "name": "Piano Adventures Level 1",
            "model": None,
            "serial_number": None,
            "supplier_id": test_supplier["id"],
            "cost": 8.50,
            "selling_price": 14.99,
            "rental_price": None,
            "stock_quantity": 10,
            "reorder_level": 5,
            "active": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Piano Adventures Level 1"
    assert data["type"] == "book"

def test_list_products_with_filter(client, admin_user, test_product):
    """Test listing products with type filter"""
    response = client.get(
        "/inventory/products?type=instrument",
        headers={"Authorization": f"Bearer {admin_user}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert all(p["type"] == "instrument" for p in data)

def test_list_low_stock_products(client, admin_user):
    """Test filtering products by low stock"""
    # Create a low stock product
    client.post(
        "/inventory/products",
        json={
            "type": "accessory",
            "name": "Guitar Strings",
            "model": None,
            "serial_number": None,
            "supplier_id": None,
            "cost": 5.00,
            "selling_price": 12.99,
            "rental_price": None,
            "stock_quantity": 2,
            "reorder_level": 5,
            "active": True
        }
    )
    
    response = client.get(
        "/inventory/products?low_stock=true",
        headers={"Authorization": f"Bearer {admin_user}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert all(p["stock_quantity"] <= p["reorder_level"] for p in data)

def test_update_product_stock(client, admin_user, test_product):
    """Test updating product stock quantity"""
    response = client.put(
        f"/inventory/products/{test_product['id']}",
        json={
            **test_product,
            "stock_quantity": 10
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["stock_quantity"] == 10

def test_delete_product(client, admin_user, test_product):
    """Test deleting a product"""
    response = client.delete(
        f"/inventory/products/{test_product['id']}",
        headers={"Authorization": f"Bearer {admin_user}"}
    )
    assert response.status_code == 200

# =============================================================================
# Rental Tests
# =============================================================================

def test_create_rental(client, admin_user, test_product, test_customer):
    """Test creating a new rental"""
    start_date = date.today()
    due_date = start_date + timedelta(days=30)
    
    response = client.post(
        "/inventory/rentals",
        json={
            "product_id": test_product["id"],
            "customer_id": test_customer["id"],
            "rental_period": "monthly",
            "start_date": start_date.isoformat(),
            "due_date": due_date.isoformat(),
            "deposit": 100.00,
            "rental_fee": 45.00,
            "condition_notes": None
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    assert data["late_fee"] == 0

def test_rental_prevents_duplicate(client, admin_user, test_product, test_customer):
    """Test that system prevents renting already-rented product"""
    # Create first rental
    start_date = date.today()
    due_date = start_date + timedelta(days=30)
    
    client.post(
        "/inventory/rentals",
        json={
            "product_id": test_product["id"],
            "customer_id": test_customer["id"],
            "rental_period": "monthly",
            "start_date": start_date.isoformat(),
            "due_date": due_date.isoformat(),
            "deposit": 100.00,
            "rental_fee": 45.00,
            "condition_notes": None
        }
    )
    
    # Try to create second rental for same product
    response = client.post(
        "/inventory/rentals",
        json={
            "product_id": test_product["id"],
            "customer_id": test_customer["id"],
            "rental_period": "weekly",
            "start_date": start_date.isoformat(),
            "due_date": (start_date + timedelta(days=7)).isoformat(),
            "deposit": 50.00,
            "rental_fee": 15.00,
            "condition_notes": None
        }
    )
    assert response.status_code == 400
    assert "already rented" in response.json()["detail"].lower()

def test_return_rental_on_time(client, admin_user, test_product, test_customer):
    """Test returning a rental on time (no late fees)"""
    # Create rental
    start_date = date.today() - timedelta(days=15)
    due_date = date.today() + timedelta(days=15)
    
    rental_response = client.post(
        "/inventory/rentals",
        json={
            "product_id": test_product["id"],
            "customer_id": test_customer["id"],
            "rental_period": "monthly",
            "start_date": start_date.isoformat(),
            "due_date": due_date.isoformat(),
            "deposit": 100.00,
            "rental_fee": 45.00,
            "condition_notes": None
        }
    )
    rental_id = rental_response.json()["id"]
    
    # Return rental
    response = client.put(
        f"/inventory/rentals/{rental_id}/return",
        json={
            "condition_notes": "Good condition"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "returned"
    assert data["late_fee"] == 0
    assert data["return_date"] is not None

def test_return_rental_late(client, admin_user, test_product, test_customer):
    """Test returning a rental late (calculate late fees)"""
    # Create overdue rental (due 14 days ago)
    start_date = date.today() - timedelta(days=44)
    due_date = date.today() - timedelta(days=14)
    
    rental_response = client.post(
        "/inventory/rentals",
        json={
            "product_id": test_product["id"],
            "customer_id": test_customer["id"],
            "rental_period": "monthly",
            "start_date": start_date.isoformat(),
            "due_date": due_date.isoformat(),
            "deposit": 100.00,
            "rental_fee": 45.00,
            "condition_notes": None
        }
    )
    rental_id = rental_response.json()["id"]
    
    # Return rental
    response = client.put(
        f"/inventory/rentals/{rental_id}/return",
        json={
            "condition_notes": "Good condition, returned late"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "returned"
    assert data["late_fee"] > 0  # Should have late fees for 14 days overdue

def test_list_rentals_by_status(client, admin_user, test_product, test_customer):
    """Test filtering rentals by status"""
    response = client.get(
        "/inventory/rentals?status=active",
        headers={"Authorization": f"Bearer {admin_user}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert all(r["status"] == "active" for r in data)

# =============================================================================
# Sale Tests
# =============================================================================

def test_record_sale(client, admin_user, test_product, test_customer):
    """Test recording a new sale"""
    initial_stock = test_product["stock_quantity"]
    
    response = client.post(
        "/inventory/sales",
        json={
            "product_id": test_product["id"],
            "customer_id": test_customer["id"],
            "date": date.today().isoformat(),
            "quantity": 2,
            "unit_price": test_product["selling_price"],
            "total_amount": test_product["selling_price"] * 2,
            "payment_method": "Credit Card"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 2
    
    # Verify stock was deducted
    product_response = client.get(
        f"/inventory/products/{test_product['id']}",
        headers={"Authorization": f"Bearer {admin_user}"}
    )
    updated_product = product_response.json()
    assert updated_product["stock_quantity"] == initial_stock - 2

def test_sale_insufficient_stock(client, admin_user, test_product, test_customer):
    """Test that sale is rejected when insufficient stock"""
    response = client.post(
        "/inventory/sales",
        json={
            "product_id": test_product["id"],
            "customer_id": test_customer["id"],
            "date": date.today().isoformat(),
            "quantity": 100,  # More than available stock
            "unit_price": test_product["selling_price"],
            "total_amount": test_product["selling_price"] * 100,
            "payment_method": "Cash"
        }
    )
    assert response.status_code == 400
    assert "insufficient stock" in response.json()["detail"].lower()

def test_list_sales(client, admin_user, test_product, test_customer):
    """Test listing all sales"""
    # Create a sale first
    client.post(
        "/inventory/sales",
        json={
            "product_id": test_product["id"],
            "customer_id": test_customer["id"],
            "date": date.today().isoformat(),
            "quantity": 1,
            "unit_price": test_product["selling_price"],
            "total_amount": test_product["selling_price"],
            "payment_method": "Debit"
        }
    )
    
    response = client.get(
        "/inventory/sales",
        headers={"Authorization": f"Bearer {admin_user}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

# =============================================================================
# RBAC Tests
# =============================================================================

def test_non_admin_cannot_create_product(client, regular_user):
    """Test that non-admin users cannot create products"""
    # Try to create product with non-admin user
    response = client.post(
        "/inventory/products",
        json={
            "type": "book",
            "name": "Test Book",
            "cost": 10.00,
            "selling_price": 20.00,
            "stock_quantity": 5,
            "reorder_level": 2,
            "active": True
        }
    )
    assert response.status_code == 403
