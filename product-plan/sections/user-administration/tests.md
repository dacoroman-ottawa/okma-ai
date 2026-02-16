# User Administration - Test Instructions

## Overview

These test instructions cover the User Administration section functionality. Tests are framework-agnostic and describe expected behaviors that should be verified.

---

## View Users

### Display user list
- [ ] User list displays in a card grid layout
- [ ] Each card shows user initials avatar, name, email, admin badge (if admin), and active status
- [ ] Summary displays total users, active count, and admin count
- [ ] Inactive users appear with reduced opacity (70%)

### Search and filter
- [ ] Search input filters users by name
- [ ] Search input filters users by email
- [ ] Filtered results count displays when search is active
- [ ] Clearing search restores full user list

### Empty states
- [ ] Empty state displays "No users yet" when no users exist
- [ ] Empty state displays "No users found" when search has no results
- [ ] Empty state suggests adding first user when list is empty
- [ ] Empty state suggests adjusting search when filter has no results

---

## Add User

### Form display
- [ ] "Add User" button is visible in the header
- [ ] Clicking "Add User" triggers the onAddUser callback
- [ ] Form should include fields for name, email, and admin checkbox

### Validation (to be implemented)
- [ ] Name field is required
- [ ] Email field is required
- [ ] Email field validates email format
- [ ] Duplicate email addresses are rejected

### Behavior
- [ ] New user is added to the list after successful creation
- [ ] Password is set via email invitation (not entered manually)

---

## Edit User

### Access edit form
- [ ] Clicking the menu button (three dots) on a user card opens the action menu
- [ ] "Edit User" option is visible in the menu
- [ ] Clicking "Edit User" triggers the onEditUser callback with the user ID

### Form behavior (to be implemented)
- [ ] Edit form pre-fills with current user data
- [ ] Name can be modified
- [ ] Email can be modified (with validation)
- [ ] Admin flag can be toggled

---

## Toggle Status

### Activate/deactivate users
- [ ] "Activate" option appears for inactive users
- [ ] "Deactivate" option appears for active users
- [ ] Clicking toggle option triggers onToggleStatus callback with user ID
- [ ] User status badge updates after toggle

### Visual feedback
- [ ] Active users show green "Active" badge with green dot
- [ ] Inactive users show gray "Inactive" badge with gray dot
- [ ] Inactive user cards have reduced opacity

---

## Send Reset Link

### Password reset flow
- [ ] "Send Reset Link" option is visible in the user menu
- [ ] Clicking "Send Reset Link" triggers onSendResetLink callback with user ID
- [ ] Confirmation or success feedback should be shown (to be implemented)

---

## Delete User

### Delete confirmation
- [ ] "Delete User" option is visible in the user menu
- [ ] Delete option is styled in red to indicate destructive action
- [ ] Clicking "Delete User" triggers onDeleteUser callback with user ID
- [ ] Confirmation dialog should appear before actual deletion (to be implemented)

### Behavior
- [ ] User is removed from the list after confirmed deletion
- [ ] Canceling delete returns to normal view without changes

---

## Responsive Design

### Mobile layout
- [ ] Header stacks vertically on small screens
- [ ] "Add User" button is full width on mobile
- [ ] User cards display in single column on small screens
- [ ] Search input is usable on mobile devices

### Desktop layout
- [ ] Header displays horizontally with title and button
- [ ] User cards display in 2-column grid on medium screens
- [ ] User cards display in 3-column grid on large screens
- [ ] Action menu positions correctly relative to card

---

## Dark Mode

### Color scheme
- [ ] Background uses dark slate colors in dark mode
- [ ] Cards use appropriate dark background
- [ ] Text colors are readable in dark mode
- [ ] Badges and status indicators are visible in dark mode
- [ ] Action menu uses dark styling
- [ ] Search input has appropriate dark mode styling

---

## Accessibility

### Keyboard navigation
- [ ] All interactive elements are focusable
- [ ] Menu can be opened and navigated via keyboard
- [ ] Actions can be triggered via keyboard

### Screen readers
- [ ] User cards have appropriate labels
- [ ] Admin badge is announced
- [ ] Status is announced
- [ ] Menu items have clear labels

---

## Edge Cases

### Large datasets
- [ ] UI remains responsive with many users
- [ ] Search performs efficiently

### Special characters
- [ ] Names with special characters display correctly
- [ ] Email addresses with special characters are handled

### Long content
- [ ] Long names are handled appropriately
- [ ] Long email addresses are truncated with ellipsis
