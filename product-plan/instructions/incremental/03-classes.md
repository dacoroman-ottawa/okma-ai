# Milestone 3: Classes

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) and Milestone 2 (People) complete

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

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/classes/tests.md` for detailed test-writing instructions.

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

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onViewClass` | Navigate to class detail/edit view |
| `onCreateClass` | Open create class flow |
| `onEditClass` | Open edit class form |
| `onRescheduleClass` | Open reschedule flow |
| `onCancelClass` | Cancel class with confirmation |
| `onMarkAttendance` | Record student attendance |

### Empty States

- **No classes yet:** Show message with "Create Class" CTA
- **No filter results:** Show "No classes match filters"

## Files to Reference

- `product-plan/sections/classes/README.md` — Feature overview
- `product-plan/sections/classes/tests.md` — Test-writing instructions
- `product-plan/sections/classes/components/` — React components
- `product-plan/sections/classes/types.ts` — TypeScript interfaces
- `product-plan/sections/classes/sample-data.json` — Test data

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

### Flow 4: Reschedule Class

1. User clicks reschedule on a class
2. User selects new day/time
3. System checks availability conflicts
4. User confirms change
5. **Outcome:** Class moved to new time slot

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
