# Milestone 4: Payments

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-3 complete

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

Implement the Payments feature — credit purchases, balance tracking, and lesson payment deductions.

## Overview

This section manages the credit-based payment system. Students purchase credits which are deducted when they attend classes. Admins can view transaction history, student balances, make adjustments, and process inventory payments.

**Key Functionality:**
- View transaction history with filters by type, date, student
- View student credit balances per enrollment
- Record credit purchases with discounts and tax
- Add manual credit adjustments with notes
- Record inventory payments for rentals/sales
- Low balance alerts for students needing credits

## Recommended Approach: Test-Driven Development

See `product-plan/sections/payments/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy from `product-plan/sections/payments/components/`:

- `PaymentsView.tsx` — Main view with Transactions/Balances tabs
- `TransactionList.tsx` — Transaction table with filters
- `StudentBalances.tsx` — Balance cards grouped by student

### Data Layer

The components expect (see `types.ts`):
- `Transaction` — id, type, studentId, enrollmentId, date, credits, amounts, tax, paymentMethod
- `StudentBalance` — studentId, enrollmentId, currentBalance, totalPurchased, totalUsed
- `TransactionType` — credit_purchase, credit_deduction, credit_adjustment, inventory_payment
- `TaxType` — HST (13%), GST (5%), None

### Callbacks

| Callback | Description |
|----------|-------------|
| `onViewTransaction` | View transaction details |
| `onViewStudentHistory` | View student's transaction history |
| `onAddCreditPurchase` | Open credit purchase form |
| `onAddAdjustment` | Open adjustment form |
| `onAddInventoryPayment` | Open inventory payment form |
| `onAddCreditsForStudent` | Quick add credits for specific student |

### Business Logic

- Credit price = teacher hourly rate (varies by enrollment)
- Tax calculation: HST 13%, GST 5%, or None
- Credits auto-deduct when attendance is marked (Classes section)
- Low balance alert when credits ≤ 2

## Expected User Flows

### Flow 1: Purchase Credits

1. User clicks "New Payment" → "Credit Purchase"
2. User selects student and enrollment
3. User enters credit quantity
4. System calculates subtotal based on teacher rate
5. User optionally applies discount
6. User selects tax type (HST/GST/None)
7. User selects payment method
8. **Outcome:** Credits added to student balance, transaction recorded

### Flow 2: View Low Balances

1. User switches to Balances tab
2. User sees student cards with balance per enrollment
3. Low balances (≤2) show amber warning, zero shows red
4. User clicks "Add Credits" on a student
5. **Outcome:** Quick path to purchase credits for that student

### Flow 3: Add Credit Adjustment

1. User clicks "New Payment" → "Credit Adjustment"
2. User selects student and enrollment
3. User enters adjustment amount (+/-)
4. User enters reason note
5. **Outcome:** Balance adjusted, transaction recorded with note

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Transaction list renders with real data
- [ ] Filters work (type, student)
- [ ] Student balances display correctly
- [ ] Low balance alerts show
- [ ] Credit purchase flow works with tax calculation
- [ ] Credit adjustments work
- [ ] Summary stats calculate correctly
- [ ] Empty states display properly
- [ ] Responsive on mobile
