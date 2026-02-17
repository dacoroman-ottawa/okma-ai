from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from datetime import date, datetime
import uuid

from backend.database import get_db
from backend.auth import get_current_user
from backend.models import (
    Supplier, Customer, Product, Rental, Sale,
    ProductTypeEnum, RentalPeriodEnum, RentalStatusEnum
)

router = APIRouter(prefix="/inventory", tags=["inventory"])

# =============================================================================
# Suppliers
# =============================================================================

@router.get("/suppliers")
async def list_suppliers(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """List all suppliers"""
    suppliers = db.query(Supplier).all()
    return suppliers

@router.post("/suppliers")
async def create_supplier(
    supplier_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Create a new supplier (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create suppliers")
    
    supplier = Supplier(
        id=supplier_data.get("id", f"sup-{uuid.uuid4().hex[:8]}"),
        name=supplier_data["name"],
        contact_person=supplier_data["contact_person"],
        email=supplier_data["email"],
        phone=supplier_data["phone"],
        address=supplier_data["address"],
        active=supplier_data.get("active", True)
    )
    
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@router.put("/suppliers/{supplier_id}")
async def update_supplier(
    supplier_id: str,
    supplier_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Update a supplier (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update suppliers")
    
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    for key, value in supplier_data.items():
        if hasattr(supplier, key):
            setattr(supplier, key, value)
    
    db.commit()
    db.refresh(supplier)
    return supplier

@router.delete("/suppliers/{supplier_id}")
async def delete_supplier(
    supplier_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Delete a supplier (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete suppliers")
    
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    db.delete(supplier)
    db.commit()
    return {"status": "success"}

# =============================================================================
# Customers
# =============================================================================

@router.get("/customers")
async def list_customers(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """List all customers"""
    customers = db.query(Customer).all()
    return customers

@router.post("/customers")
async def create_customer(
    customer_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Create a new customer (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create customers")
    
    customer = Customer(
        id=customer_data.get("id", f"cust-{uuid.uuid4().hex[:8]}"),
        name=customer_data["name"],
        email=customer_data["email"],
        phone=customer_data["phone"],
        address=customer_data["address"],
        notes=customer_data.get("notes")
    )
    
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.put("/customers/{customer_id}")
async def update_customer(
    customer_id: str,
    customer_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Update a customer (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update customers")
    
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in customer_data.items():
        if hasattr(customer, key):
            setattr(customer, key, value)
    
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/customers/{customer_id}")
async def delete_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Delete a customer (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete customers")
    
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(customer)
    db.commit()
    return {"status": "success"}

# =============================================================================
# Products
# =============================================================================

@router.get("/products")
async def list_products(
    type: Optional[str] = None,
    low_stock: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """List all products with optional filters"""
    query = db.query(Product)
    
    if type:
        query = query.filter(Product.type == type)
    
    if low_stock:
        query = query.filter(Product.stock_quantity <= Product.reorder_level)
    
    products = query.all()
    return products

@router.get("/products/{product_id}")
async def get_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get a single product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/products")
async def create_product(
    product_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Create a new product (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create products")
    
    product = Product(
        id=product_data.get("id", f"prod-{uuid.uuid4().hex[:8]}"),
        type=ProductTypeEnum(product_data["type"]),
        name=product_data["name"],
        model=product_data.get("model"),
        serial_number=product_data.get("serial_number"),
        supplier_id=product_data.get("supplier_id"),
        cost=product_data["cost"],
        selling_price=product_data["selling_price"],
        rental_price=product_data.get("rental_price"),
        stock_quantity=product_data.get("stock_quantity", 0),
        reorder_level=product_data.get("reorder_level", 0),
        active=product_data.get("active", True)
    )
    
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    product_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Update a product (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update products")
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_data.items():
        if key in ("id", "created_at"):  # Skip immutable fields
            continue
        if key == "type" and value:
            setattr(product, key, ProductTypeEnum(value))
        elif hasattr(product, key):
            setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Delete a product (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete products")
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return {"status": "success"}

# =============================================================================
# Rentals
# =============================================================================

@router.get("/rentals")
async def list_rentals(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """List all rentals with optional status filter"""
    query = db.query(Rental)
    
    if status:
        query = query.filter(Rental.status == status)
    
    rentals = query.all()
    return rentals

@router.get("/rentals/{rental_id}")
async def get_rental(
    rental_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get a single rental by ID"""
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    return rental

@router.post("/rentals")
async def create_rental(
    rental_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Create a new rental (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create rentals")
    
    # Check if product has stock
    product = db.query(Product).filter(Product.id == rental_data["product_id"]).first()
    if not product or product.stock_quantity <= 0:
        raise HTTPException(status_code=400, detail="Product not available for rental")
    
    # Check if product already has an active rental
    existing_rental = db.query(Rental).filter(
        Rental.product_id == rental_data["product_id"],
        Rental.status.in_([RentalStatusEnum.ACTIVE, RentalStatusEnum.OVERDUE])
    ).first()
    
    if existing_rental:
        raise HTTPException(status_code=400, detail="Product is already rented")
    
    rental = Rental(
        id=rental_data.get("id", f"rent-{uuid.uuid4().hex[:8]}"),
        product_id=rental_data["product_id"],
        customer_id=rental_data["customer_id"],
        rental_period=RentalPeriodEnum(rental_data["rental_period"]),
        start_date=datetime.fromisoformat(rental_data["start_date"]).date(),
        due_date=datetime.fromisoformat(rental_data["due_date"]).date(),
        deposit=rental_data["deposit"],
        rental_fee=rental_data["rental_fee"],
        late_fee=0,
        status=RentalStatusEnum.ACTIVE,
        condition_notes=rental_data.get("condition_notes")
    )
    
    db.add(rental)
    db.commit()
    db.refresh(rental)
    return rental

@router.put("/rentals/{rental_id}/return")
async def return_rental(
    rental_id: str,
    return_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Mark a rental as returned and calculate late fees (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can return rentals")
    
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    
    return_date = date.today()
    rental.return_date = return_date
    rental.status = RentalStatusEnum.RETURNED
    rental.condition_notes = return_data.get("condition_notes", rental.condition_notes)
    
    # Calculate late fee if overdue
    if return_date > rental.due_date:
        days_overdue = (return_date - rental.due_date).days
        # Late fee: 50% of rental fee per week (7 days)
        weeks_overdue = days_overdue / 7.0
        rental.late_fee = round(rental.rental_fee * 0.5 * weeks_overdue, 2)
    
    db.commit()
    db.refresh(rental)
    return rental

# =============================================================================
# Sales
# =============================================================================

@router.get("/sales")
async def list_sales(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """List all sales"""
    sales = db.query(Sale).all()
    return sales

@router.post("/sales")
async def record_sale(
    sale_data: dict,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Record a new sale (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can record sales")
    
    # Check stock availability
    product = db.query(Product).filter(Product.id == sale_data["product_id"]).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    quantity = sale_data["quantity"]
    if product.stock_quantity < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock for this sale")
    
    sale = Sale(
        id=sale_data.get("id", f"sale-{uuid.uuid4().hex[:8]}"),
        product_id=sale_data["product_id"],
        customer_id=sale_data["customer_id"],
        date=datetime.fromisoformat(sale_data["date"]).date(),
        quantity=quantity,
        unit_price=sale_data["unit_price"],
        total_amount=sale_data["total_amount"],
        payment_method=sale_data["payment_method"]
    )
    
    # Deduct stock
    product.stock_quantity -= quantity
    
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale
