# Milestone 5: Inventory

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-4 complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement the Inventory feature — product catalog with rental and sales tracking for instruments, accessories, and merchandise.

## Overview

This section manages the music school's inventory including instruments for rent, books, accessories, musical scores, and gift cards. It tracks stock levels, active rentals with due dates, sales history, suppliers, and customers.

**Key Functionality:**
- View product catalog with filters by type, supplier, stock status
- Low stock alerts (amber for approaching, red for below reorder level)
- Create and manage rentals with terms, deposits, and late fees
- Record sales with payment methods
- Manage suppliers with contact information
- Manage customers (separate from students)

## Recommended Approach: Test-Driven Development

See `product-plan/sections/inventory/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy from `product-plan/sections/inventory/components/`:

- `InventoryView.tsx` — Main view with 5 tabs
- `ProductsTab.tsx` — Product catalog with filters and alerts
- `RentalsTab.tsx` — Active rentals with status
- `SalesTab.tsx` — Sales history
- `SuppliersTab.tsx` — Supplier management
- `CustomersTab.tsx` — Customer management

### Data Layer

The components expect (see `types.ts`):
- `Product` — id, type, name, model, serialNumber, supplierId, cost, sellingPrice, rentalPrice, stockQuantity, reorderLevel
- `ProductType` — instrument, book, accessory, musical_score, gift_card
- `Rental` — productId, customerId, rentalPeriod, dueDate, deposit, lateFee, status
- `Sale` — productId, customerId, date, quantity, paymentMethod
- `Supplier` — name, contactPerson, email, phone, address
- `Customer` — name, email, phone, address, notes

### Callbacks

| Callback | Description |
|----------|-------------|
| `onAddProduct` / `onEditProduct` / `onDeleteProduct` | Product CRUD |
| `onAddSupplier` / `onEditSupplier` / `onDeleteSupplier` | Supplier CRUD |
| `onAddCustomer` / `onEditCustomer` / `onDeleteCustomer` | Customer CRUD |
| `onCreateRental` / `onReturnRental` | Rental management |
| `onRecordSale` | Record new sale |

### Business Logic

- Stock alerts: amber when stock ≤ reorderLevel, red when stock = 0
- Rental periods: weekly or monthly
- Late fees calculated based on days overdue
- Deposits tracked and refunded on return

## Expected User Flows

### Flow 1: Create Rental

1. User goes to Rentals tab, clicks "New Rental"
2. User selects product and customer
3. User sets rental period (weekly/monthly), due date, deposit
4. System calculates rental fee
5. **Outcome:** Rental created, product marked as rented

### Flow 2: Return Rental

1. User finds active rental in list
2. User clicks return action
3. User notes condition of item
4. System calculates any late fees
5. **Outcome:** Rental marked returned, deposit processed

### Flow 3: Low Stock Alert

1. User views Products tab
2. Products below reorder level show warning badges
3. User clicks "Low Stock" filter to see all alerts
4. User can reorder from supplier
5. **Outcome:** Stock issues identified and addressed

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] All 5 tabs render with real data
- [ ] Product CRUD works
- [ ] Low stock alerts display
- [ ] Rental create/return flow works
- [ ] Late fees calculate correctly
- [ ] Sales recording works
- [ ] Supplier and Customer CRUD works
- [ ] Tab badges show counts
- [ ] Empty states display properly
- [ ] Responsive on mobile
