import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Shield,
  Mail,
  MoreVertical,
  Pencil,
  Trash2,
  Key,
  Power,
  Users,
} from 'lucide-react'
import type { UserAdministrationProps, AppUser } from '../types'

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function UserAdministrationView({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onAddUser,
  onToggleStatus,
  onSendResetLink,
}: UserAdministrationProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  const activeCount = users.filter((u) => u.isActive).length
  const adminCount = users.filter((u) => u.isAdmin).length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              User Administration
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {users.length} users, {activeCount} active, {adminCount} admin
              {adminCount !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={onAddUser}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Results count when filtered */}
        {searchQuery && (
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        )}

        {/* User grid */}
        {filteredUsers.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
              {searchQuery ? 'No users found' : 'No users yet'}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Add your first user to get started'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isMenuOpen={openMenuId === user.id}
                onToggleMenu={() =>
                  setOpenMenuId(openMenuId === user.id ? null : user.id)
                }
                onCloseMenu={() => setOpenMenuId(null)}
                onView={() => onViewUser?.(user.id)}
                onEdit={() => {
                  setOpenMenuId(null)
                  onEditUser?.(user.id)
                }}
                onDelete={() => {
                  setOpenMenuId(null)
                  onDeleteUser?.(user.id)
                }}
                onToggleStatus={() => {
                  setOpenMenuId(null)
                  onToggleStatus?.(user.id)
                }}
                onSendResetLink={() => {
                  setOpenMenuId(null)
                  onSendResetLink?.(user.id)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// Sub-components
// =============================================================================

interface UserCardProps {
  user: AppUser
  isMenuOpen: boolean
  onToggleMenu: () => void
  onCloseMenu: () => void
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggleStatus?: () => void
  onSendResetLink?: () => void
}

function UserCard({
  user,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onSendResetLink,
}: UserCardProps) {
  return (
    <div
      onClick={onView}
      className={`relative cursor-pointer rounded-xl border bg-white p-5 transition-all hover:shadow-md dark:bg-slate-900 ${
        user.isActive
          ? 'border-slate-200 dark:border-slate-700'
          : 'border-slate-200 opacity-70 dark:border-slate-700'
      }`}
    >
      {/* Header with avatar and menu */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${
              user.isAdmin
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {getInitials(user.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {user.name}
              </h3>
              {user.isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleMenu()
            }}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseMenu()
                }}
              />
              <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" />
                  Edit User
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSendResetLink?.()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Key className="h-4 w-4" />
                  Send Reset Link
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStatus?.()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Power className="h-4 w-4" />
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete User
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status and last login */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              user.isActive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                user.isActive ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Last login: {formatDate(user.lastLoginAt)}
        </p>
      </div>
    </div>
  )
}
