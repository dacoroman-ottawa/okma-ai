# Payments Section - Test Instructions

## Overview

These tests cover the Payments section functionality including viewing transactions, viewing student balances, adding credit purchases, and adding credit adjustments.

---

## 1. View Transactions

### 1.1 Display Transaction List
**Given** the user navigates to the Payments section
**When** the page loads with transaction data
**Then** transactions should be displayed in a list sorted by date (newest first)
**And** each transaction row should show: date, type badge, student name, details, credits change, and amount

### 1.2 Empty State
**Given** the user navigates to the Payments section
**When** there are no transactions
**Then** an empty state message should be displayed: "No transactions yet"
**And** a description: "Transactions will appear here when credits are purchased or classes are attended."

### 1.3 Filter by Transaction Type
**Given** the user is viewing the transaction list
**When** the user selects "Credit Purchases" from the type filter
**Then** only transactions of type `credit_purchase` should be displayed
**And** a count message should show "Showing X of Y transactions"

### 1.4 Filter by Student
**Given** the user is viewing the transaction list
**When** the user selects a student from the student filter
**Then** only transactions for that student should be displayed

### 1.5 Combined Filters
**Given** the user has selected a type filter
**When** the user also selects a student filter
**Then** transactions should be filtered by both type AND student

### 1.6 Transaction Type Badges
**Given** transactions are displayed
**Then** each transaction should show a colored badge:
- Credit Purchase: green/emerald badge with credit card icon
- Class Attended (deduction): gray/slate badge with minus icon
- Adjustment: amber badge with sliders icon
- Inventory: indigo badge with package icon

### 1.7 Credits Display
**Given** a transaction has a positive credit change
**Then** it should display with a "+" prefix in green
**Given** a transaction has a negative credit change
**Then** it should display without prefix in gray
**Given** a transaction has zero credits (inventory payment)
**Then** it should display a dash "—"

### 1.8 Mobile Responsive View
**Given** the user views the transaction list on a mobile device
**Then** transactions should display as cards instead of a table
**And** each card should show student name, type, instrument, date, credits, and amount

---

## 2. View Student Balances

### 2.1 Display Balances Tab
**Given** the user is on the Payments section
**When** the user clicks the "Balances" tab
**Then** student balance cards should be displayed in a grid

### 2.2 Student Balance Cards
**Given** the balances view is displayed
**Then** each card should show:
- Student avatar (initials)
- Student name
- History button
- For each enrollment: instrument, teacher, current balance, used/purchased counts, progress bar

### 2.3 Empty Balances State
**Given** no students have credit balances
**When** the balances tab is selected
**Then** an empty state should show: "No credit balances yet"

### 2.4 Low Balance Alert
**Given** a student has 2 or fewer credits remaining
**Then** the balance should be highlighted in amber
**And** an alert icon should appear

### 2.5 Zero Balance Alert
**Given** a student has 0 credits remaining
**Then** the balance should be highlighted in red
**And** the card background should have a red tint

### 2.6 Add Credits Button
**Given** the user is viewing student balances
**When** the user clicks "Add Credits" on an enrollment
**Then** the `onAddCredits` callback should be called with studentId and enrollmentId

### 2.7 View Student History
**Given** the user is viewing student balances
**When** the user clicks the history button on a student card
**Then** the `onViewStudentHistory` callback should be called with the studentId

---

## 3. Add Credit Purchase

### 3.1 Open Credit Purchase Form
**Given** the user is on the Payments section
**When** the user clicks "New Payment" then "Credit Purchase"
**Then** the `onAddCreditPurchase` callback should be triggered

### 3.2 Credit Purchase Form Fields
**Given** the credit purchase form is open
**Then** the form should include:
- Student selection dropdown
- Enrollment selection (filtered by selected student)
- Number of credits input
- Discount amount field
- Discount note field
- Tax type dropdown (HST 13%, GST 5%, No tax)
- Payment method dropdown (Credit Card, Debit, Cash, E-Transfer)

### 3.3 Price Calculation
**Given** the user selects an enrollment
**Then** the price per credit should be based on the teacher's hourly rate
**And** subtotal should equal credits x price per credit
**And** tax should be calculated on (subtotal - discount)
**And** total should equal subtotal - discount + tax

### 3.4 Submit Credit Purchase
**Given** the user fills out all required fields
**When** the user submits the form
**Then** a new transaction of type `credit_purchase` should be created
**And** the student's balance should increase by the number of credits

---

## 4. Add Credit Adjustment

### 4.1 Open Adjustment Form
**Given** the user is on the Payments section
**When** the user clicks "New Payment" then "Credit Adjustment"
**Then** the `onAddAdjustment` callback should be triggered

### 4.2 Adjustment Form Fields
**Given** the credit adjustment form is open
**Then** the form should include:
- Student selection dropdown
- Enrollment selection (filtered by selected student)
- Credits input (positive to add, negative to remove)
- Note/reason field (required)

### 4.3 Positive Adjustment
**Given** the user enters a positive credit value
**When** the form is submitted
**Then** a transaction of type `credit_adjustment` should be created with positive credits
**And** the student's balance should increase

### 4.4 Negative Adjustment
**Given** the user enters a negative credit value
**When** the form is submitted
**Then** a transaction of type `credit_adjustment` should be created with negative credits
**And** the student's balance should decrease

### 4.5 Adjustment Note Required
**Given** the user is filling out the adjustment form
**When** the note field is empty
**Then** the form should not submit
**And** a validation error should appear

---

## 5. Summary Statistics

### 5.1 Total Revenue
**Given** the Payments section is loaded
**Then** the "Total Revenue" stat should show the sum of all transaction amounts (where amount > 0)

### 5.2 Outstanding Credits
**Given** the Payments section is loaded
**Then** the "Outstanding Credits" stat should show the sum of all current balances

### 5.3 Low Balance Alerts
**Given** the Payments section is loaded
**Then** the "Low Balance Alerts" stat should show the count of enrollments with 2 or fewer credits
**And** if count > 0, the number should be highlighted in amber

---

## 6. Add Inventory Payment

### 6.1 Open Inventory Payment Form
**Given** the user is on the Payments section
**When** the user clicks "New Payment" then "Inventory Payment"
**Then** the `onAddInventoryPayment` callback should be triggered

### 6.2 Inventory Payment Form Fields
**Given** the inventory payment form is open
**Then** the form should include:
- Customer selection dropdown
- Line items section (description, quantity, unit price per item)
- Add item button
- Discount amount field
- Discount note field
- Tax type dropdown
- Payment method dropdown

### 6.3 Line Items Calculation
**Given** the user adds multiple line items
**Then** each line item total should be quantity x unit price
**And** subtotal should be sum of all line item totals

### 6.4 Submit Inventory Payment
**Given** the user fills out all required fields
**When** the user submits the form
**Then** a new transaction of type `inventory_payment` should be created
**And** the lineItems array should contain all added items
