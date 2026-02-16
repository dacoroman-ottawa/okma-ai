# People Section - Test Instructions

## Overview

Test coverage for the People section which manages teacher and student profiles, availability schedules, and enrollments.

---

## Teachers List View

### Display Teachers Grid

- [ ] Teachers are displayed in a responsive card grid (1 column mobile, 2 columns tablet, 3 columns desktop)
- [ ] Each card shows teacher name, specialization, instruments taught, hourly rate, and availability summary
- [ ] Active/inactive status badge is visible on each card
- [ ] Teacher count summary shows active and inactive counts in the header
- [ ] "Add Teacher" button is visible in the header

### Empty State

- [ ] When no teachers exist, show empty state with "No teachers found" message
- [ ] Empty state includes "Add Teacher" button
- [ ] When filters return no results, show "Try adjusting your filters" message

### Filter by Name

- [ ] Search input filters teachers by name in real-time
- [ ] Search is case-insensitive
- [ ] Clearing the search shows all teachers again
- [ ] Results count updates to show "Showing X of Y teachers"

### Filter by Instrument

- [ ] Instrument dropdown shows all available instruments
- [ ] Selecting an instrument filters to teachers who teach that instrument
- [ ] "All Instruments" option clears the filter
- [ ] Selected instrument is visually highlighted in the dropdown

### Filter by Active Status

- [ ] Toggle between All/Active/Inactive views
- [ ] Active filter shows only active teachers
- [ ] Inactive filter shows only inactive teachers
- [ ] All shows both active and inactive teachers

### Combined Filters

- [ ] Multiple filters can be combined (name + instrument + status)
- [ ] "Clear" button appears when any filter is active
- [ ] Clicking "Clear" resets all filters

---

## Teacher Detail View

### Profile Header

- [ ] Teacher name and initials avatar are displayed
- [ ] Active/inactive status badge is shown
- [ ] Specialization is displayed below the name
- [ ] All instruments taught are shown as badges
- [ ] Hourly rate and qualification are visible
- [ ] Biography is displayed if available

### Contact Information

- [ ] Email is displayed and clickable (mailto link)
- [ ] Phone number is displayed
- [ ] Address is displayed
- [ ] Employment start date is shown
- [ ] Date of birth is shown if available

### Availability Grid

- [ ] Weekly grid displays Mon-Sun columns
- [ ] Time rows show 8AM to 8PM
- [ ] Filled cells indicate available time slots
- [ ] Empty cells indicate unavailable times
- [ ] Legend explains the color coding

### Assigned Students

- [ ] List shows all students enrolled with this teacher
- [ ] Each entry shows student name, initials avatar, and instrument
- [ ] Enrollment start date is displayed
- [ ] Student count is shown in the section header
- [ ] Clicking a student navigates to their detail view
- [ ] Empty state shown when no students assigned

### Actions

- [ ] "Back to Teachers" link navigates to teachers list
- [ ] "Edit" button triggers edit callback
- [ ] "Delete" button triggers delete callback with confirmation styling

---

## Students List View

### Display Students Grid

- [ ] Students are displayed in a responsive card grid
- [ ] Each card shows student name, age, skill levels with instruments
- [ ] Active/inactive status badge is visible on each card
- [ ] Availability summary (days per week) is shown
- [ ] Student count summary shows active and inactive counts

### Empty State

- [ ] When no students exist, show empty state message
- [ ] Empty state includes "Add Student" button
- [ ] Filtered empty state shows different message

### Filter by Name

- [ ] Search input filters students by name in real-time
- [ ] Search is case-insensitive
- [ ] Results count updates dynamically

### Filter by Instrument

- [ ] Instrument dropdown filters by student's enrolled instruments
- [ ] Shows students who have that instrument in their skill levels

### Filter by Active Status

- [ ] Toggle between All/Active/Inactive views
- [ ] Filters work correctly for student status

### Skill Level Display

- [ ] Beginner level shown with green styling
- [ ] Intermediate level shown with amber styling
- [ ] Advanced level shown with indigo styling
- [ ] Students with no instruments show "No instruments yet"

---

## Student Detail View

### Profile Header

- [ ] Student name and initials avatar are displayed
- [ ] Active/inactive status badge is shown
- [ ] Age is calculated and displayed (or "Age not specified")
- [ ] Skill levels for each instrument are shown with appropriate styling

### Contact Information

- [ ] Email is displayed and clickable
- [ ] Phone number is displayed
- [ ] Address is displayed
- [ ] Date of birth is shown if available

### Availability Grid

- [ ] Weekly availability grid displays correctly
- [ ] Shows same format as teacher availability

### Current Enrollments

- [ ] List shows all teacher/instrument pairings for this student
- [ ] Each entry shows teacher name, specialization, and instrument
- [ ] Hourly rate and enrollment start date are displayed
- [ ] Teacher count is shown in section header
- [ ] Clicking a teacher navigates to their detail view
- [ ] Empty state shown when no enrollments

### Actions

- [ ] "Back to Students" link navigates to students list
- [ ] "Edit" button triggers edit callback
- [ ] "Delete" button triggers delete callback

---

## Availability Grid Component

### Display

- [ ] Grid shows 7 days (Mon-Sun) as columns
- [ ] Grid shows 13 hours (8AM-8PM) as rows
- [ ] Time labels show AM/PM format
- [ ] Day labels are abbreviated (Mon, Tue, etc.)
- [ ] Grid is horizontally scrollable on mobile

### Visual States

- [ ] Available slots are highlighted with indigo color
- [ ] Unavailable slots use default background
- [ ] Dark mode colors are applied correctly
- [ ] Legend explains available vs unavailable

### Tooltips

- [ ] Hovering a cell shows day and time in tooltip

---

## Responsive Behavior

### Mobile (< 640px)

- [ ] Single column card grid
- [ ] Filter bar stacks vertically
- [ ] Detail view sections stack vertically
- [ ] Availability grid is horizontally scrollable

### Tablet (640px - 1024px)

- [ ] Two column card grid
- [ ] Filter bar flows horizontally
- [ ] Detail view uses two-column grid where appropriate

### Desktop (> 1024px)

- [ ] Three column card grid
- [ ] Full-width filter bar
- [ ] Detail view maximizes space usage

---

## Dark Mode

- [ ] All cards use dark backgrounds (slate-900)
- [ ] Text colors adjust for dark backgrounds
- [ ] Status badges use appropriate dark mode colors
- [ ] Availability grid colors work in dark mode
- [ ] Hover states are visible in dark mode
- [ ] Border colors use slate-700/800
- [ ] Input fields have dark backgrounds

---

## Edge Cases

### Data Variations

- [ ] Teacher with no biography (field should be hidden)
- [ ] Teacher with null date of birth (should not show)
- [ ] Student with no skill levels (shows "No instruments yet")
- [ ] Student with null date of birth (shows "Age not specified")
- [ ] Person with no availability slots (shows "No availability")
- [ ] Teacher with no assigned students (shows empty state)
- [ ] Student with no enrollments (shows empty state)
- [ ] Inactive teacher with availability (should still show)

### Long Content

- [ ] Long teacher names truncate properly on cards
- [ ] Long specialization text handles overflow
- [ ] Multiple instruments wrap properly
- [ ] Long addresses display correctly in detail view
