// =============================================================================
// Data Types
// =============================================================================

export interface AppUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
}

// =============================================================================
// Component Props
// =============================================================================

export interface UserAdministrationProps {
  /** List of application users */
  users: AppUser[]
  /** Called when user wants to view user details */
  onViewUser?: (id: string) => void
  /** Called when user wants to edit a user */
  onEditUser?: (id: string) => void
  /** Called when user wants to delete a user */
  onDeleteUser?: (id: string) => void
  /** Called when user wants to add a new user */
  onAddUser?: () => void
  /** Called when user wants to toggle active status */
  onToggleStatus?: (id: string) => void
  /** Called when user wants to send a password reset link */
  onSendResetLink?: (id: string) => void
}
