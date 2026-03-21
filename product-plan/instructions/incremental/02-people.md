# Milestone 2: People

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

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

Implement the People feature — teacher and student profiles with availability calendars and contact information.

## Overview

This section allows administrators to manage teacher and student profiles. Teachers have qualifications, hourly rates, and availability slots. Students have skill levels for each instrument and their own availability. Both can be filtered and searched.

**Key Functionality:**
- View teachers in a card grid with filters by instrument and status
- View students in a card grid with filters by instrument, teacher, and status
- View detailed profiles with contact info, biography, and enrollments
- Visual availability grid showing weekly time slots
- Add, edit, and delete teachers and students

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/people/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

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

Wire up these user actions:

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

### Empty States

Implement empty state UI for when no records exist:

- **No teachers yet:** Show message with "Add Teacher" CTA
- **No students yet:** Show message with "Add Student" CTA
- **No filter results:** Show "No results found, try adjusting filters"

## Files to Reference

- `product-plan/sections/people/README.md` — Feature overview
- `product-plan/sections/people/tests.md` — Test-writing instructions
- `product-plan/sections/people/components/` — React components
- `product-plan/sections/people/types.ts` — TypeScript interfaces
- `product-plan/sections/people/sample-data.json` — Test data

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

### Flow 4: View Student Details

1. User switches to Students tab
2. User clicks on a student card
3. User sees profile with contact info, skill levels per instrument
4. User sees availability grid and current enrollments
5. **Outcome:** Complete student profile displayed

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
