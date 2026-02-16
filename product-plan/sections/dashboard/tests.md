# Dashboard Section - Test Instructions

## Overview

This document provides test instructions for the Dashboard section. Tests should verify metrics display, class listings, credit alerts, and inventory alerts functionality.

---

## Metrics Display

### Display all four metrics cards

**Given:** Dashboard is rendered with metrics data
**When:** The page loads
**Then:**
- [ ] "Classes Today" metric card displays the correct count
- [ ] "Students Enrolled" metric card displays the correct count
- [ ] "Active Rentals" metric card displays the correct count
- [ ] "Low Stock Items" metric card displays the correct count

### Low stock indicator styling

**Given:** Dashboard has low stock items (lowStockCount > 0)
**When:** The page loads
**Then:**
- [ ] "Low Stock Items" metric card shows amber/warning styling

**Given:** Dashboard has no low stock items (lowStockCount = 0)
**When:** The page loads
**Then:**
- [ ] "Low Stock Items" metric card shows neutral/slate styling

---

## Today's Classes

### Display today's classes list

**Given:** Dashboard is rendered with today's classes
**When:** The page loads
**Then:**
- [ ] Today's Classes section header shows correct count badge
- [ ] Classes are displayed in time order
- [ ] Each class shows time (formatted as AM/PM)
- [ ] Each class shows instrument name
- [ ] Each class shows teacher name
- [ ] Each class shows student name (single) or count (multiple)
- [ ] Each class shows duration in minutes
- [ ] Group classes display a "Group" badge

### Empty state for today's classes

**Given:** Dashboard is rendered with no today's classes
**When:** The page loads
**Then:**
- [ ] Today's Classes section shows empty state with calendar icon
- [ ] Empty state message reads "No classes scheduled for today"

### Click on today's class

**Given:** Dashboard is rendered with today's classes
**When:** User clicks on a class row
**Then:**
- [ ] onViewClass callback is called with the class ID

---

## Upcoming Classes

### Display upcoming classes list

**Given:** Dashboard is rendered with upcoming classes
**When:** The page loads
**Then:**
- [ ] Upcoming This Week section header shows correct count badge
- [ ] Classes are displayed with date and time
- [ ] Date shows weekday abbreviation (e.g., "Sat")
- [ ] Time is formatted as AM/PM
- [ ] Each class shows instrument name and teacher name
- [ ] Group classes display a "Group" badge

### Empty state for upcoming classes

**Given:** Dashboard is rendered with no upcoming classes
**When:** The page loads
**Then:**
- [ ] Upcoming This Week section shows empty state with calendar icon
- [ ] Empty state message reads "No more classes this week"

### Click on upcoming class

**Given:** Dashboard is rendered with upcoming classes
**When:** User clicks on a class row
**Then:**
- [ ] onViewClass callback is called with the class ID

---

## Credit Alerts

### Display credit alerts list

**Given:** Dashboard is rendered with credit alerts
**When:** The page loads
**Then:**
- [ ] Low Credit Alerts section header shows wallet icon
- [ ] Section header shows alert count badge when alerts exist
- [ ] Each alert shows student name
- [ ] Each alert shows instrument and teacher info
- [ ] Each alert shows credit balance
- [ ] Zero balance alerts show red styling ("0 credits")
- [ ] Low balance alerts show amber styling
- [ ] Critical alerts have red left border
- [ ] Warning alerts have amber left border

### Empty state for credit alerts

**Given:** Dashboard is rendered with no credit alerts
**When:** The page loads
**Then:**
- [ ] Low Credit Alerts section shows empty state with wallet icon
- [ ] Empty state message reads "All students have sufficient credits"
- [ ] No count badge is shown in the header

### Click on credit alert

**Given:** Dashboard is rendered with credit alerts
**When:** User clicks on a credit alert row
**Then:**
- [ ] onViewStudent callback is called with the student ID

---

## Inventory Alerts

### Display inventory alerts list

**Given:** Dashboard is rendered with inventory alerts
**When:** The page loads
**Then:**
- [ ] Inventory Alerts section header shows alert triangle icon
- [ ] Section header shows alert count badge when alerts exist
- [ ] Each alert shows product name
- [ ] Low stock alerts show current stock vs minimum level
- [ ] Low stock alerts display "Low Stock" badge
- [ ] Low stock alerts show package icon
- [ ] Overdue rental alerts show customer name
- [ ] Overdue rental alerts show days overdue in red
- [ ] Overdue rental alerts display "Overdue" badge
- [ ] Overdue rental alerts show clock icon

### Severity styling for inventory alerts

**Given:** Dashboard is rendered with inventory alerts of varying severity
**When:** The page loads
**Then:**
- [ ] Critical alerts have red left border
- [ ] Warning alerts have amber left border
- [ ] Low severity alerts have slate/neutral left border
- [ ] Critical severity badges have appropriate styling
- [ ] Warning severity badges have appropriate styling

### Empty state for inventory alerts

**Given:** Dashboard is rendered with no inventory alerts
**When:** The page loads
**Then:**
- [ ] Inventory Alerts section shows empty state with package icon
- [ ] Empty state message reads "No inventory issues"
- [ ] No count badge is shown in the header

### Click on inventory alert

**Given:** Dashboard is rendered with inventory alerts
**When:** User clicks on an inventory alert row
**Then:**
- [ ] onViewInventoryAlert callback is called with the alert ID

---

## Responsive Layout

### Desktop layout (lg breakpoint and above)

**Given:** Dashboard is viewed on a large screen
**When:** The page loads
**Then:**
- [ ] Metrics cards display in a 4-column grid
- [ ] Main content displays in a 2-column layout
- [ ] Today's and Upcoming classes in left column
- [ ] Credit and Inventory alerts in right column

### Tablet layout (md to lg breakpoints)

**Given:** Dashboard is viewed on a medium screen
**When:** The page loads
**Then:**
- [ ] Metrics cards display in a 2-column grid
- [ ] Main content stacks vertically

### Mobile layout (below md breakpoint)

**Given:** Dashboard is viewed on a small screen
**When:** The page loads
**Then:**
- [ ] Metrics cards stack vertically
- [ ] Main content sections stack vertically
- [ ] All content remains readable and accessible

---

## Dark Mode

### All components render correctly in dark mode

**Given:** Dark mode is enabled
**When:** Dashboard is rendered
**Then:**
- [ ] Background uses dark slate colors
- [ ] Text is light colored and readable
- [ ] Cards have appropriate dark backgrounds
- [ ] Borders use dark slate colors
- [ ] All severity indicators maintain proper contrast
- [ ] All badges are visible and readable
- [ ] Empty states are visible with appropriate icon colors

---

## Accessibility

### Screen reader support

**Given:** Dashboard is rendered
**When:** Screen reader navigates the page
**Then:**
- [ ] Section headings are properly structured
- [ ] Metric labels are readable
- [ ] Class information is accessible
- [ ] Alert information conveys severity

### Keyboard navigation

**Given:** Dashboard is rendered
**When:** User navigates with keyboard
**Then:**
- [ ] Interactive rows are focusable
- [ ] Focus states are visible
- [ ] Enter/Space activates clickable rows
