# Milestone 6: Dashboard

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-5 complete

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

Implement the Dashboard — at-a-glance overview of schedules, balances, and key metrics for administrators.

## Overview

The dashboard is a read-only overview that aggregates data from all other sections. It shows today's activity, upcoming classes, and alerts that need attention. This is the default landing page for administrators.

**Key Functionality:**
- View key activity metrics (classes today, students enrolled, active rentals, low stock count)
- See today's class schedule with times and teacher names
- See upcoming classes for the rest of the week
- View students with low or zero credit balances
- View inventory alerts (low stock products, overdue rentals)

## Recommended Approach: Test-Driven Development

See `product-plan/sections/dashboard/tests.md` for detailed test-writing instructions.

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

### Flow 3: Check Upcoming Week

1. User scrolls to upcoming classes section
2. User sees next 5-7 classes with dates and times
3. User can click any class to view details
4. **Outcome:** Week preview without leaving dashboard

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
