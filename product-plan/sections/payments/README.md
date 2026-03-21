# Payments Section

## Overview

Manage credit purchases, balance tracking, and lesson payment deductions. Admins can view transaction history and student credit balances, record new credit purchases with discounts and taxes, and process inventory payments for rentals and sales.

## User Flows

1. **View Transactions** - View all transactions in a filterable list (by type, date, student)
2. **View Student Balances** - View student credit balances summary with drill-down to individual history
3. **Record Credit Purchase** - Select student, see their enrollments, enter quantity, discount, and tax, then confirm payment
4. **Automatic Credit Deduction** - Credits are automatically deducted when attendance is marked in Classes
5. **Add Credit Adjustment** - Add manual credit adjustments (add/remove credits with a note)
6. **Record Inventory Payment** - Select customer, add items, apply discounts and tax, select payment method, then confirm

## UI Requirements

- Transaction list view with filters for type (credits, inventory, adjustment), date range, and student
- Student balances view showing each student's current credit balance per enrollment
- Credit purchase form with enrollment selection, quantity input, discount field, and tax dropdown (HST 13%, GST 5%, No tax)
- Price per credit based on teacher hourly rate and instrument
- Transaction rows show date, type, student, amount, and balance change
- Inventory payment form with line items, subtotal, discount, tax, and payment method
- Credit adjustment form with amount (+/-) and reason note

## Components

| Component | Description |
|-----------|-------------|
| `PaymentsView` | Main payments view with tabs for transactions and balances, summary stats, filters, and action menu |
| `TransactionList` | Displays transactions in a sortable table (desktop) or card list (mobile) with type badges and amounts |
| `StudentBalances` | Grid of student balance cards grouped by student, with enrollment details and low balance alerts |

## Data Types

- `Transaction` - Payment and credit activity record (purchases, deductions, adjustments, inventory)
- `StudentBalance` - Current credit balance for a student per enrollment
- `TransactionType` - credit_purchase, credit_deduction, credit_adjustment, inventory_payment
- `TaxType` - HST, GST, None
- `PaymentMethod` - Credit Card, Debit, Cash, E-Transfer, or null
- `LineItem` - Item in an inventory payment (description, quantity, unit price)

## Configuration

- shell: true (renders within application shell)
