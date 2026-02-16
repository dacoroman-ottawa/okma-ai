# Classes Section

## Overview

Schedule and manage recurring music lessons for private and group classes. Admins can view classes in a calendar or list format, create enrollments that match teacher and student availability, and track attendance for each session.

## User Flows

1. **View Classes** - View all scheduled classes in a weekly calendar or list view
2. **Toggle View Mode** - Switch between calendar and list views
3. **Filter Classes** - Filter classes by teacher, student, day of week, or instrument
4. **Create Class** - Select student and instrument, see matching teachers (based on availability and instrument), choose time slot (weekday, time, duration), set frequency (once or twice per week)
5. **Group Classes** - Add multiple students to a group class during creation
6. **Edit Class** - Modify class details (teacher, time, students, duration)
7. **Reschedule Class** - Move a class to a different time slot
8. **Cancel Class** - Cancel a class session
9. **Mark Attendance** - Track attendance for each student in a class

## UI Requirements

- Weekly calendar view with time slots showing scheduled classes
- List view with sortable/filterable table of classes
- Filter bar with teacher, student, day, and instrument dropdowns
- Availability highlighting: show conflicts when classes overlap with unavailable times
- Class cards/rows show teacher, student(s), instrument, time, duration, and type (private/group)
- Duration options: 30, 45, or 60 minutes
- Frequency options: once or twice per week
- Modal or side panel for creating/editing classes
- Attendance checkboxes for each student in a class

## Components

| Component | Description |
|-----------|-------------|
| `ClassesView` | Main view component with header, view toggle, filters, and content area |
| `ClassesCalendar` | Weekly calendar grid showing classes positioned by day and time |
| `ClassesList` | Sortable list/table view of all classes with action menu |
| `ClassCard` | Compact card displaying class details (used in calendar view) |
| `ClassesFilterBar` | Filter dropdowns for teacher, student, instrument, and day |

## Data Types

- `Class` - Scheduled lesson with teacher, students, instrument, time, duration, frequency, and status
- `AttendanceRecord` - Tracks whether a student attended a specific class session
- `Weekday` - Day of week (Monday through Sunday)
- `Duration` - Class length in minutes (30, 45, or 60)
- `Frequency` - How often class occurs (1 = weekly, 2 = twice per week)
- `ClassStatus` - Whether class is scheduled or cancelled
- `ClassType` - Private (single student) or group (multiple students)

## Dependencies

This section depends on data from the People section:
- Teachers (with their instruments and availability)
- Students (with their availability)
- Instruments
