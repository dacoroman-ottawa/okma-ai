export interface AppUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'teacher' | 'student'
  isAdmin: boolean
  isActive: boolean
  isVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface UserAdministrationProps {
  users: AppUser[]
  onViewUser?: (userId: string) => void
  onEditUser?: (userId: string) => void
  onDeleteUser?: (userId: string) => void
  onAddUser: () => void
  onToggleStatus?: (userId: string) => void
  onSendResetLink?: (userId: string) => void
}

export interface CreateUserData {
  name: string
  email: string
  role?: 'admin' | 'teacher' | 'student'
  isAdmin?: boolean
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: 'admin' | 'teacher' | 'student'
  isAdmin?: boolean
}
