# Complete Implementation Instructions

> **Provide alongside:** `product-overview.md`
> **Use this for:** Full implementation in one session

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

# Milestone 1: Foundation

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Colors:**
- Primary: `indigo` — buttons, links, key accents
- Secondary: `amber` — tags, highlights, alerts
- Neutral: `slate` — backgrounds, text, borders

**Typography:**
- Heading/Body: DM Sans
- Mono: JetBrains Mono

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/README.md` for entity descriptions
- Core entities: Teacher, Student, Instrument, Enrollment, Class, Product, Rental, Sale, CreditTransaction, AppUser

### 3. Routing Structure

Create placeholder routes for each section:

| Route | Section |
|-------|---------|
| `/` or `/dashboard` | Dashboard |
| `/people` | People (Teachers & Students) |
| `/classes` | Classes |
| `/payments` | Payments |
| `/inventory` | Inventory |
| `/users` | User Administration |

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper with sidebar
- `MainNav.tsx` — Navigation component with icons
- `UserMenu.tsx` — User menu with avatar and logout

**Wire Up Navigation:**

| Nav Item | Route | Icon |
|----------|-------|------|
| Dashboard | `/dashboard` | LayoutDashboard |
| People | `/people` | Users |
| Classes | `/classes` | Calendar |
| Payments | `/payments` | CreditCard |
| Inventory | `/inventory` | Package |
| Users | `/users` | Shield |

## Done When

- [ ] Design tokens are configured (fonts loading, colors available)
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with navigation
- [ ] Navigation links to correct routes
- [ ] User menu shows user info
- [ ] Responsive on mobile (hamburger menu works)
- [ ] Dark mode works

---

# Milestone 2: People

## Goal

Implement the People feature — teacher and student profiles with availability calendars and contact information.

## Overview

This section allows administrators to manage teacher and student profiles. Teachers have qualifications, hourly rates, and availability slots. Students have skill levels for each instrument and their own availability. Both can be filtered and searched.

**Key Functionality:**
- View teachers in a card grid with filters by instrument and status
- View students in a card grid with filters by instrument, teacher, and status
- View detailed profiles with contact info, biography, and enrollments
- Visual availability grid showing weekly time slots
- Add, edit, and delete teachers and students

## What to Implement

### Components

Copy the section components from `product-plan/sections/people/components/`:

- `TeachersList.tsx` — Teacher card grid with filters
- `TeacherCard.tsx` — Individual teacher card
- `TeacherDetail.tsx` — Teacher detail view with availability
- `StudentsList.tsx` — Student card grid with filters
- `StudentCard.tsx` — Individual student card
- `StudentDetail.tsx` — Student detail view with enrollments
- `AvailabilityGrid.tsx` — Weekly availability grid component
- `FilterBar.tsx` — Reusable filter component

### Data Layer

The components expect these data shapes (see `types.ts`):
- `Teacher` — name, email, phone, address, bio, qualifications, hourlyRate, instruments, availability
- `Student` — name, email, phone, address, dateOfBirth, skillLevels, availability
- `Instrument` — id, name
- `Enrollment` — studentId, teacherId, instrumentId
- `AvailabilitySlot` — day, startTime, endTime

### Callbacks

| Callback | Description |
|----------|-------------|
| `onViewTeacher` | Navigate to teacher detail page |
| `onEditTeacher` | Open teacher edit form |
| `onDeleteTeacher` | Delete teacher with confirmation |
| `onAddTeacher` | Open create teacher form |
| `onViewStudent` | Navigate to student detail page |
| `onEditStudent` | Open student edit form |
| `onDeleteStudent` | Delete student with confirmation |
| `onAddStudent` | Open create student form |

## Expected User Flows

### Flow 1: View Teacher List

1. User navigates to `/people` (defaults to Teachers tab)
2. User sees grid of teacher cards with initials, name, instruments, hourly rate
3. User can filter by instrument or active status
4. **Outcome:** Filtered list updates in real-time

### Flow 2: View Teacher Details

1. User clicks on a teacher card
2. User sees full profile: contact info, biography, qualifications, hourly rate
3. User sees availability grid showing weekly slots
4. User sees list of assigned students/enrollments
5. **Outcome:** Complete teacher profile displayed

### Flow 3: Add New Teacher

1. User clicks "Add Teacher" button
2. User fills in name, email, phone, address, biography, qualifications, hourly rate
3. User selects instruments taught
4. User sets availability slots
5. User clicks "Save"
6. **Outcome:** New teacher appears in list

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Teachers list renders with real data
- [ ] Students list renders with real data
- [ ] Filters work correctly
- [ ] Detail views show complete profiles
- [ ] Availability grid displays correctly
- [ ] CRUD operations work for teachers and students
- [ ] Empty states display properly
- [ ] Responsive on mobile

---

# Milestone 3: Classes

## Goal

Implement the Classes feature — class scheduling and enrollment management for both private lessons and group classes.

## Overview

This section enables administrators to schedule and manage music lessons. Classes can be private (one student) or group (multiple students). The view supports both calendar and list modes with filtering by teacher, student, instrument, or day.

**Key Functionality:**
- View classes in weekly calendar view with time-slot positioning
- View classes in sortable list view
- Toggle between calendar and list views
- Filter by teacher, student, instrument, or weekday
- Create new classes with availability matching
- Edit, reschedule, and cancel classes
- Mark attendance for students

## What to Implement

### Components

Copy the section components from `product-plan/sections/classes/components/`:

- `ClassesView.tsx` — Main view with calendar/list toggle and filters
- `ClassesCalendar.tsx` — Weekly calendar grid
- `ClassesList.tsx` — Table list view
- `ClassCard.tsx` — Individual class block for calendar
- `ClassesFilterBar.tsx` — Filter controls

### Data Layer

The components expect these data shapes (see `types.ts`):
- `Class` — id, teacherId, studentIds, instrumentId, weekday, startTime, duration, type, status
- `AttendanceRecord` — classId, studentId, date, attended
- References to Teacher, Student, Instrument from People section

### Callbacks

| Callback | Description |
|----------|-------------|
| `onViewClass` | Navigate to class detail/edit view |
| `onCreateClass` | Open create class flow |
| `onEditClass` | Open edit class form |
| `onRescheduleClass` | Open reschedule flow |
| `onCancelClass` | Cancel class with confirmation |
| `onMarkAttendance` | Record student attendance |

## Expected User Flows

### Flow 1: View Calendar

1. User navigates to `/classes`
2. User sees weekly calendar with classes positioned by day and time
3. Private classes show in indigo, group classes in amber
4. User can hover/click classes to see details
5. **Outcome:** Visual weekly schedule displayed

### Flow 2: Create New Class

1. User clicks "New Class" button
2. User selects student and instrument
3. User sees matching teachers based on availability
4. User selects time slot (weekday, time, duration)
5. User sets frequency (once or twice per week)
6. User clicks "Create"
7. **Outcome:** New class appears on calendar

### Flow 3: Mark Attendance

1. User views a class (from calendar or list)
2. User sees list of enrolled students
3. User marks each student as present or absent
4. System automatically deducts credits for attended classes
5. **Outcome:** Attendance recorded, credits updated

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Calendar view renders classes correctly
- [ ] List view renders with sorting
- [ ] View toggle works
- [ ] All filters work
- [ ] Create class flow completes
- [ ] Attendance marking works
- [ ] Credits deducted on attendance
- [ ] Empty states display properly
- [ ] Responsive on mobile

---

# Milestone 4: Payments

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

---

# Milestone 5: Inventory

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

---

# Milestone 6: Dashboard

## Goal

Implement the Dashboard — at-a-glance overview of schedules, balances, and key metrics for administrators.

## Overview

The dashboard is a read-only overview that aggregates data from all other sections. It shows today's activity, upcoming classes, and alerts that need attention. This is the default landing page for administrators.

**Key Functionality:**
- View key activity metrics (classes today, students enrolled, active rentals, low stock count)
- See today's class schedule with times and teacher names
- See upcoming classes for the rest of the week
- View students with low or zero credit balances
- View inventory alerts (low stock products, overdue rentals)

## What to Implement

### Components

Copy from `product-plan/sections/dashboard/components/`:

- `DashboardView.tsx` — Main dashboard with all sections

The component includes sub-components:
- `MetricCard` — Individual metric display
- `TodaysClassRow` — Today's class item
- `UpcomingClassRow` — Upcoming class item
- `CreditAlertRow` — Low credit alert
- `InventoryAlertRow` — Inventory alert

### Data Layer

The components expect (see `types.ts`):
- `DashboardMetrics` — classesToday, studentsEnrolled, activeRentals, lowStockCount
- `TodaysClass` — time, duration, teacherName, studentNames, instrumentName, type
- `UpcomingClass` — date, time, duration, teacherName, studentNames, instrumentName
- `CreditAlert` — studentName, instrumentName, currentBalance, severity
- `InventoryAlert` — type (low_stock/overdue_rental), productName, severity, details

### Callbacks

| Callback | Description |
|----------|-------------|
| `onViewClass` | Navigate to class details |
| `onViewStudent` | Navigate to student profile (for credit alerts) |
| `onViewInventoryAlert` | Navigate to product or rental |

### Data Aggregation

The dashboard requires a backend endpoint that aggregates:
- Count of classes scheduled for today
- Total enrolled students
- Active rental count
- Products below reorder level
- Today's classes ordered by time
- Next 5-7 upcoming classes
- Students with balance ≤ 2 credits
- Products with stock ≤ reorderLevel + overdue rentals

## Expected User Flows

### Flow 1: Morning Check

1. User logs in, lands on dashboard
2. User sees today's date and 4 metric cards
3. User reviews today's class schedule
4. User notes any alerts (low credits, overdue rentals)
5. **Outcome:** Quick overview of daily priorities

### Flow 2: Address Credit Alert

1. User sees student with 0 credits in alerts
2. User clicks on the alert
3. User navigates to student profile or payments
4. User can add credits
5. **Outcome:** Alert resolved by purchasing credits

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Metrics cards show correct counts
- [ ] Today's classes list renders
- [ ] Upcoming classes list renders
- [ ] Credit alerts display with severity
- [ ] Inventory alerts display (low stock + overdue)
- [ ] All click handlers navigate correctly
- [ ] Empty states display when no alerts
- [ ] Responsive on mobile
- [ ] Real-time or cached data updates appropriately

---

# Milestone 7: User Administration

## Goal

Implement User Administration — manage application users with roles, active status, and password reset capabilities.

## Overview

This section manages who can log in to the application. App users are separate from teachers and students — they represent system accounts. Users can be admins (full access) or regular users. Admins can activate/deactivate users and send password reset links.

**Key Functionality:**
- View all app users in a card grid
- Search/filter users by name or email
- Add new users (password set via email invitation)
- Edit user details (name, email, admin flag)
- Toggle active/inactive status
- Send password reset links
- Delete users with confirmation

## What to Implement

### Components

Copy from `product-plan/sections/user-administration/components/`:

- `UserAdministrationView.tsx` — Main view with user card grid

### Data Layer

The components expect (see `types.ts`):
- `AppUser` — id, name, email, isAdmin, isActive, createdAt, lastLoginAt

### Callbacks

| Callback | Description |
|----------|-------------|
| `onViewUser` | View user details |
| `onEditUser` | Open edit user form |
| `onDeleteUser` | Delete user with confirmation |
| `onAddUser` | Open create user form |
| `onToggleStatus` | Activate/deactivate user |
| `onSendResetLink` | Send password reset email |

### Security Considerations

- Only admins should access this section
- Password never exposed — only reset links
- Email validation required
- Cannot deactivate yourself
- Cannot delete yourself
- Audit log recommended for user changes

## Expected User Flows

### Flow 1: Add New User

1. Admin clicks "Add User"
2. Admin enters name and email
3. Admin optionally checks "Administrator"
4. Admin clicks "Save"
5. System sends invitation email with password setup link
6. **Outcome:** New user appears in grid (inactive until they set password)

### Flow 2: Deactivate User

1. Admin finds user in grid
2. Admin clicks menu → "Deactivate"
3. User card shows inactive status
4. User can no longer log in
5. **Outcome:** Access revoked without deleting history

### Flow 3: Send Password Reset

1. Admin finds user who forgot password
2. Admin clicks menu → "Send Reset Link"
3. System sends password reset email to user
4. **Outcome:** User can reset their own password

### Flow 4: Delete User

1. Admin clicks menu → "Delete User"
2. Confirmation dialog appears
3. Admin confirms deletion
4. **Outcome:** User removed (consider soft delete for audit)

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] User grid renders with real data
- [ ] Search/filter works
- [ ] Add user flow works with email validation
- [ ] Edit user works
- [ ] Status toggle works
- [ ] Reset link sends email
- [ ] Delete works with confirmation
- [ ] Admin-only access enforced
- [ ] Cannot modify own admin status
- [ ] Empty states display properly
- [ ] Responsive on mobile

---

# Implementation Complete Checklist

When all milestones are done, verify:

- [ ] All design tokens applied consistently
- [ ] All routes navigable
- [ ] All CRUD operations work
- [ ] All filters and search work
- [ ] All empty states display
- [ ] Dark mode works throughout
- [ ] Responsive on mobile throughout
- [ ] Authentication and authorization enforced
- [ ] Error handling for API failures
- [ ] Loading states during data fetches
