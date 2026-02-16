# User Administration

## Overview

Manage application users who can log in to the system. Admins can create, edit, and delete users, control active status, and send password reset links. Passwords are self-managed by users.

## User Flows

- **View all app users** - Display users in a card grid with name, email, admin badge, and status
- **Add a new user** - Create user with name, email, and admin flag (password set via email invitation)
- **Edit user details** - Modify name, email, and admin flag
- **Toggle user status** - Activate or deactivate users
- **Send password reset link** - Allow users to reset their own passwords
- **Delete a user** - Remove a user from the system with confirmation

## UI Requirements

- Card grid layout showing user cards with initials avatar, name, email, admin badge, and active status
- Filter/search by name or email
- User form with name, email (validated), and admin checkbox
- Active/inactive toggle on user cards
- "Send Reset Link" button for password management
- Confirmation dialog for delete actions

## Components

### UserAdministrationView

The main component for the User Administration section.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `users` | `AppUser[]` | List of application users |
| `onViewUser` | `(id: string) => void` | Called when user wants to view user details |
| `onEditUser` | `(id: string) => void` | Called when user wants to edit a user |
| `onDeleteUser` | `(id: string) => void` | Called when user wants to delete a user |
| `onAddUser` | `() => void` | Called when user wants to add a new user |
| `onToggleStatus` | `(id: string) => void` | Called when user wants to toggle active status |
| `onSendResetLink` | `(id: string) => void` | Called when user wants to send a password reset link |

## Data Types

### AppUser

```typescript
interface AppUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
}
```

## Configuration

- **Shell integration**: true (displayed within the application shell)
