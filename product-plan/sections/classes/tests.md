# Classes Section - Test Instructions

## Overview

This document outlines the test scenarios for the Classes section. Tests are framework-agnostic and describe user flows, expected behaviors, and edge cases.

---

## Calendar View Tests

### Display Classes on Calendar

- [ ] Classes are displayed on the correct day column
- [ ] Classes are positioned at the correct time slot (8 AM - 8 PM range)
- [ ] Class height corresponds to duration (30, 45, or 60 minutes)
- [ ] Private classes display with indigo styling
- [ ] Group classes display with amber styling
- [ ] Cancelled classes display with red styling and reduced opacity
- [ ] Class cards show time, instrument, teacher name, and student names
- [ ] Group classes show student count when more than 2 students (e.g., "Alice +2")

### Calendar Navigation

- [ ] Calendar displays all 7 days (Monday through Sunday)
- [ ] Time labels show hours from 8 AM to 8 PM
- [ ] Calendar is horizontally scrollable on smaller screens
- [ ] Clicking a class card triggers the onViewClass callback

---

## List View Tests

### Display Classes in List

- [ ] Classes are sorted by day of week, then by time
- [ ] Each row displays: day/time, instrument, teacher, students, type badge, duration
- [ ] Private classes show "Private" badge with indigo styling
- [ ] Group classes show "Group" badge with amber styling
- [ ] Cancelled classes show "Cancelled" badge with red styling
- [ ] Classes with frequency 2 show "(2x/week)" indicator
- [ ] Group classes show multiple student names or count

### List Actions

- [ ] Clicking a row triggers the onViewClass callback
- [ ] Three-dot menu opens on click
- [ ] Edit option triggers onEditClass callback
- [ ] Reschedule option triggers onRescheduleClass callback
- [ ] Cancel option triggers onCancelClass callback
- [ ] Cancel option is hidden for already-cancelled classes
- [ ] Menu closes when clicking outside

---

## View Toggle Tests

- [ ] Default view is calendar
- [ ] Clicking "List" button switches to list view
- [ ] Clicking "Calendar" button switches to calendar view
- [ ] Active view button has dark background styling
- [ ] View preference persists while filters are applied

---

## Filter Tests

### Teacher Filter

- [ ] Dropdown shows all available teachers
- [ ] "All Teachers" option clears the filter
- [ ] Selecting a teacher shows only their classes
- [ ] Selected teacher name appears in dropdown button
- [ ] Filter applies to both calendar and list views

### Student Filter

- [ ] Dropdown shows all available students
- [ ] "All Students" option clears the filter
- [ ] Selecting a student shows classes they are enrolled in
- [ ] Works for both private and group classes

### Instrument Filter

- [ ] Dropdown shows all available instruments
- [ ] "All Instruments" option clears the filter
- [ ] Selecting an instrument shows only classes for that instrument

### Day Filter

- [ ] Dropdown shows all 7 days of the week
- [ ] "All Days" option clears the filter
- [ ] Selecting a day shows only classes on that day
- [ ] In calendar view, all days still display but only filtered day has classes

### Combined Filters

- [ ] Multiple filters can be applied simultaneously
- [ ] Results count shows "Showing X of Y classes" when filtered
- [ ] "Clear" button appears when any filter is active
- [ ] "Clear" button resets all filters at once

---

## Create Class Flow Tests

### Basic Creation

- [ ] "New Class" button triggers onCreateClass callback
- [ ] Form allows selecting a student
- [ ] Form allows selecting an instrument
- [ ] Form shows teachers who teach the selected instrument
- [ ] Form allows selecting weekday
- [ ] Form allows selecting start time
- [ ] Form allows selecting duration (30, 45, or 60 minutes)
- [ ] Form allows selecting frequency (1 or 2 times per week)

### Group Class Creation

- [ ] Form allows adding multiple students
- [ ] Class type automatically sets to "group" with 2+ students
- [ ] Class type automatically sets to "private" with 1 student

### Availability Matching

- [ ] Only available time slots are selectable
- [ ] Teacher availability is respected
- [ ] Student availability is respected
- [ ] Conflicts are highlighted or disabled

---

## Edit Class Flow Tests

- [ ] Existing class data populates the form
- [ ] Teacher can be changed
- [ ] Time slot can be changed
- [ ] Duration can be changed
- [ ] Students can be added or removed
- [ ] Notes can be edited
- [ ] Cancel button discards changes

---

## Reschedule Class Tests

- [ ] Reschedule flow allows changing weekday
- [ ] Reschedule flow allows changing start time
- [ ] Availability constraints are still enforced
- [ ] Original class details are preserved

---

## Cancel Class Tests

- [ ] Cancel action updates class status to "cancelled"
- [ ] Cancelled classes display differently in calendar (red, reduced opacity)
- [ ] Cancelled classes display differently in list (red badge)
- [ ] Cancelled classes can still be viewed but not cancelled again

---

## Attendance Tracking Tests

- [ ] Each student in a class can be marked as attended or not attended
- [ ] Attendance is recorded with the specific date
- [ ] Attendance records are persisted
- [ ] Group classes track attendance for each student individually
- [ ] Historical attendance records are accessible

---

## Empty State Tests

- [ ] List view shows "No classes found" when no classes exist
- [ ] List view shows "No classes found" when filters return no results
- [ ] Calendar view shows empty grid when no classes exist
- [ ] Appropriate messaging when no classes match filters

---

## Responsive Design Tests

- [ ] Calendar view is scrollable on mobile
- [ ] List view stacks columns appropriately on small screens
- [ ] Filter bar wraps on narrow viewports
- [ ] View toggle remains accessible on all screen sizes
- [ ] Action menu positions correctly on mobile

---

## Dark Mode Tests

- [ ] All text is readable in dark mode
- [ ] Class card backgrounds adapt to dark mode
- [ ] Badge colors maintain contrast in dark mode
- [ ] Borders and dividers are visible in dark mode
- [ ] Dropdown menus adapt to dark mode

---

## Accessibility Tests

- [ ] All interactive elements are keyboard accessible
- [ ] Dropdowns can be navigated with arrow keys
- [ ] Focus states are visible
- [ ] Screen readers can announce class information
- [ ] Color is not the only indicator of class type (badges include text)
