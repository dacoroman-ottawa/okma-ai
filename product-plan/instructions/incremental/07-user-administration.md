# Milestone 7: User Administration

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-6 complete

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

## Recommended Approach: Test-Driven Development

See `product-plan/sections/user-administration/tests.md` for detailed test-writing instructions.

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
