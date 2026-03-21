import { useState } from 'react'
import { Menu, X, Music } from 'lucide-react'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'

interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  user?: {
    name: string
    avatarUrl?: string
  }
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

export function AppShell({
  children,
  navigationItems,
  user,
  onNavigate,
  onLogout,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <Music className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            KanataMusicAcademy
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <MainNav
          items={navigationItems}
          onNavigate={(href) => {
            onNavigate?.(href)
            setSidebarOpen(false)
          }}
        />

        {/* User Menu */}
        <UserMenu user={user} onLogout={onLogout} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Music className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              KanataMusicAcademy
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
