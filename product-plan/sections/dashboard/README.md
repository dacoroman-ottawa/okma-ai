# Dashboard Section

## Overview

At-a-glance weekly overview for administrators showing today's and upcoming classes, student credit alerts, and inventory alerts. Activity-focused metrics at the top with today highlighted in the weekly view.

## User Flows

- View key activity metrics (classes today, students enrolled, active rentals, low stock count)
- See today's class schedule with times and teacher names
- See upcoming classes for the rest of the week
- View students with low or zero credit balances
- View inventory alerts (low stock products and overdue rentals)

## UI Requirements

- Metrics cards row at the top showing activity counts
- Today's Classes section with time-ordered list
- Upcoming Classes section showing next 5-7 classes
- Low Credit Alerts section highlighting students needing attention
- Inventory Alerts section showing low stock and overdue rentals
- Read-only dashboard (no action buttons, navigation to other sections for actions)
- Weekly scope with today highlighted

## Components

### DashboardView

The main dashboard component that displays all dashboard sections.

**Props:**
- `metrics` - Summary metrics for the dashboard header (DashboardMetrics)
- `todaysClasses` - Classes scheduled for today (TodaysClass[])
- `upcomingClasses` - Classes scheduled for later this week (UpcomingClass[])
- `creditAlerts` - Students with low or zero credit balances (CreditAlert[])
- `inventoryAlerts` - Low stock products and overdue rentals (InventoryAlert[])
- `onViewClass` - Callback when user clicks on a class to view details
- `onViewStudent` - Callback when user clicks on a credit alert to view student
- `onViewInventoryAlert` - Callback when user clicks on an inventory alert

**Sub-components (internal):**
- `MetricCard` - Individual metric display card
- `TodaysClassRow` - Row item for today's classes list
- `UpcomingClassRow` - Row item for upcoming classes list
- `CreditAlertRow` - Row item for credit alerts list
- `InventoryAlertRow` - Row item for inventory alerts list

## Data Types

See `types.ts` for full TypeScript interfaces:
- `DashboardMetrics` - Summary counts (classesToday, studentsEnrolled, activeRentals, lowStockCount)
- `TodaysClass` - Class scheduled for today with time, duration, teacher, students, instrument, type
- `UpcomingClass` - Class scheduled for later with date, time, duration, teacher, students, instrument, type
- `CreditAlert` - Student with low credits including severity level
- `InventoryAlert` - Low stock or overdue rental alert with severity level
- `AlertSeverity` - 'low' | 'warning' | 'critical'
- `ClassType` - 'private' | 'group'
- `InventoryAlertType` - 'low_stock' | 'overdue_rental'

## Sample Data

See `sample-data.json` for example data demonstrating:
- 4 metrics values
- 4 today's classes (mix of private and group)
- 6 upcoming classes across multiple days
- 3 credit alerts with varying severity
- 4 inventory alerts (low stock and overdue rentals)

## Configuration

- shell: true (uses application shell wrapper)
