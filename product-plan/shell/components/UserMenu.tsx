import { LogOut } from 'lucide-react'

interface UserMenuProps {
  user?: {
    name: string
    avatarUrl?: string
  }
  onLogout?: () => void
  collapsed?: boolean
}

export function UserMenu({ user, onLogout, collapsed = false }: UserMenuProps) {
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (collapsed) {
    return (
      <div className="p-2">
        <button
          onClick={onLogout}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          title="Logout"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
              {initials}
            </div>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="border-t border-slate-200 p-4 dark:border-slate-700">
      <div className="flex items-center gap-3">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {user?.name || 'User'}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
