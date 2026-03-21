import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Package,
} from 'lucide-react'

interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

interface MainNavProps {
  items: NavigationItem[]
  onNavigate?: (href: string) => void
  collapsed?: boolean
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Dashboard: LayoutDashboard,
  People: Users,
  Classes: Calendar,
  Payments: CreditCard,
  Inventory: Package,
}

export function MainNav({ items, onNavigate, collapsed = false }: MainNavProps) {
  return (
    <nav className="flex-1 px-2 py-4">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = iconMap[item.label] || LayoutDashboard
          return (
            <li key={item.href}>
              <button
                onClick={() => onNavigate?.(item.href)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  item.isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${
                  item.isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
