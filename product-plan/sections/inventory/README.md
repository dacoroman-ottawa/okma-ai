# Inventory Section

## Overview

Manage the product catalog including instruments, books, accessories, musical scores, and gift cards. Track stock levels, active rentals with terms and due dates, and sales history. Manage suppliers and customers. Alerts highlight products below re-order levels.

## User Flows

### Products
- View product catalog with filters by type, supplier, and stock status (including "Low Stock" filter)
- Add/edit/delete products with type, name, model, serial number, supplier, pricing, and stock levels

### Suppliers
- View supplier list with contact details and associated products
- Add/edit/delete suppliers with name, contact person, email, phone, and address

### Customers
- View customer list with contact details and rental/purchase history
- Add/edit/delete customers with name, email, phone, and address

### Rentals
- Create a rental: select product, select customer, set rental period (weekly/monthly), due date, deposit, and fees
- Return a rental: mark as returned, note condition, calculate any late fees
- View active rentals with due dates and overdue alerts

### Sales
- Record a sale: select product, select customer, process payment (links to Payments)
- View sales history with filters by date and product

## UI Requirements

- Five-tab layout: Products, Rentals, Sales, Suppliers, Customers
- Product list with inline low-stock warning badges (amber for approaching, red for below re-order level)
- "Low Stock" quick filter in Products tab
- Rental list showing customer, product, due date, and status (active/overdue/returned)
- Sales history table with date, customer, product, and amount
- Supplier list with name, contact info, and product count
- Customer list with name, contact info, and active rentals count
- Product form with type dropdown, supplier dropdown, pricing fields (cost, selling price, rental price), and re-order threshold
- Supplier form with contact fields
- Customer form with contact fields

## Components

| Component | Description |
|-----------|-------------|
| `InventoryView` | Main container with five-tab navigation (Products, Rentals, Sales, Suppliers, Customers) |
| `ProductsTab` | Product catalog with search, type/supplier/stock filters, and low-stock alerts |
| `RentalsTab` | Rental management with status filters (all/active/overdue) and return functionality |
| `SalesTab` | Sales history with revenue summary and date-sorted transactions |
| `SuppliersTab` | Supplier directory with contact info and product counts |
| `CustomersTab` | Customer directory with contact info and active rental counts |

## Data Types

- `Product` - Catalog item with type, pricing, stock levels, and reorder threshold
- `Supplier` - Vendor with contact information
- `Customer` - Person who rents or purchases products
- `Rental` - Rental record with period, dates, fees, and status
- `Sale` - Sale record with date, quantity, and payment method
- `ProductType` - instrument, book, accessory, musical_score, gift_card
- `RentalStatus` - active, overdue, returned
- `RentalPeriod` - weekly, monthly
- `PaymentMethod` - Credit Card, Debit, Cash, E-Transfer
