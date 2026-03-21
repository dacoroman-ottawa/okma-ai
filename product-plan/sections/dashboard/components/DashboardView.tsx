import {
  Calendar,
  Users,
  Clock,
  Package,
  AlertTriangle,
  Wallet,
  ChevronRight,
  User,
} from 'lucide-react'
import type {
  DashboardProps,
  TodaysClass,
  UpcomingClass,
  CreditAlert,
  InventoryAlert,
  AlertSeverity,
} from '../types'

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'warning':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'low':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }
}

function getSeverityBorderColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical':
      return 'border-l-red-500'
    case 'warning':
      return 'border-l-amber-500'
    case 'low':
      return 'border-l-slate-300 dark:border-l-slate-600'
  }
}

export function DashboardView({
  metrics,
  todaysClasses,
  upcomingClasses,
  creditAlerts,
  inventoryAlerts,
  onViewClass,
  onViewStudent,
  onViewInventoryAlert,
}: DashboardProps) {
  const today = new Date().toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {today}
          </p>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Calendar}
            label="Classes Today"
            value={metrics.classesToday}
            color="indigo"
          />
          <MetricCard
            icon={Users}
            label="Students Enrolled"
            value={metrics.studentsEnrolled}
            color="amber"
          />
          <MetricCard
            icon={Clock}
            label="Active Rentals"
            value={metrics.activeRentals}
            color="indigo"
          />
          <MetricCard
            icon={Package}
            label="Low Stock Items"
            value={metrics.lowStockCount}
            color={metrics.lowStockCount > 0 ? 'amber' : 'slate'}
          />
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            {/* Today's Classes */}
            <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  Today's Classes
                </h2>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {todaysClasses.length}
                </span>
              </div>
              {todaysClasses.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    No classes scheduled for today
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {todaysClasses.map((cls) => (
                    <TodaysClassRow
                      key={cls.id}
                      classItem={cls}
                      onClick={() => onViewClass?.(cls.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming Classes */}
            <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  Upcoming This Week
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {upcomingClasses.length}
                </span>
              </div>
              {upcomingClasses.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    No more classes this week
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {upcomingClasses.map((cls) => (
                    <UpcomingClassRow
                      key={cls.id}
                      classItem={cls}
                      onClick={() => onViewClass?.(cls.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right column - Alerts */}
          <div className="space-y-6">
            {/* Credit Alerts */}
            <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-amber-500" />
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                    Low Credit Alerts
                  </h2>
                </div>
                {creditAlerts.length > 0 && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {creditAlerts.length}
                  </span>
                )}
              </div>
              {creditAlerts.length === 0 ? (
                <div className="p-8 text-center">
                  <Wallet className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    All students have sufficient credits
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {creditAlerts.map((alert) => (
                    <CreditAlertRow
                      key={alert.id}
                      alert={alert}
                      onClick={() => onViewStudent?.(alert.studentId)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Inventory Alerts */}
            <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                    Inventory Alerts
                  </h2>
                </div>
                {inventoryAlerts.length > 0 && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {inventoryAlerts.length}
                  </span>
                )}
              </div>
              {inventoryAlerts.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    No inventory issues
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inventoryAlerts.map((alert) => (
                    <InventoryAlertRow
                      key={alert.id}
                      alert={alert}
                      onClick={() => onViewInventoryAlert?.(alert.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Sub-components
// =============================================================================

interface MetricCardProps {
  icon: typeof Calendar
  label: string
  value: number
  color: 'indigo' | 'amber' | 'slate'
}

function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

interface TodaysClassRowProps {
  classItem: TodaysClass
  onClick?: () => void
}

function TodaysClassRow({ classItem, onClick }: TodaysClassRowProps) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {formatTime(classItem.time).split(' ')[0]}
          </span>
          <span className="text-xs text-indigo-500 dark:text-indigo-400">
            {formatTime(classItem.time).split(' ')[1]}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {classItem.instrumentName}
            </p>
            {classItem.type === 'group' && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Group
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {classItem.teacherName} &middot;{' '}
            {classItem.studentNames.length === 1
              ? classItem.studentNames[0]
              : `${classItem.studentNames.length} students`}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {classItem.duration} min
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-400" />
    </div>
  )
}

interface UpcomingClassRowProps {
  classItem: UpcomingClass
  onClick?: () => void
}

function UpcomingClassRow({ classItem, onClick }: UpcomingClassRowProps) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center justify-between px-5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
    >
      <div className="flex items-center gap-4">
        <div className="w-20 text-sm">
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {formatDate(classItem.date).split(',')[0]}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            {formatTime(classItem.time)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {classItem.instrumentName}
            </p>
            {classItem.type === 'group' && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Group
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {classItem.teacherName}
          </p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </div>
  )
}

interface CreditAlertRowProps {
  alert: CreditAlert
  onClick?: () => void
}

function CreditAlertRow({ alert, onClick }: CreditAlertRowProps) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center justify-between border-l-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${getSeverityBorderColor(alert.severity)}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {alert.studentName}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {alert.instrumentName} with {alert.teacherName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2.5 py-1 text-sm font-bold ${
            alert.currentBalance === 0
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          }`}
        >
          {alert.currentBalance} credits
        </span>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  )
}

interface InventoryAlertRowProps {
  alert: InventoryAlert
  onClick?: () => void
}

function InventoryAlertRow({ alert, onClick }: InventoryAlertRowProps) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center justify-between border-l-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${getSeverityBorderColor(alert.severity)}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg p-2 ${
            alert.type === 'overdue_rental'
              ? 'bg-red-100 dark:bg-red-900/30'
              : 'bg-amber-100 dark:bg-amber-900/30'
          }`}
        >
          {alert.type === 'overdue_rental' ? (
            <Clock
              className={`h-5 w-5 ${
                alert.severity === 'critical'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            />
          ) : (
            <Package
              className={`h-5 w-5 ${
                alert.severity === 'critical'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            />
          )}
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {alert.productName}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {alert.type === 'overdue_rental' ? (
              <>
                Rented by {alert.customerName} &middot;{' '}
                <span className="text-red-600 dark:text-red-400">
                  {alert.daysOverdue} days overdue
                </span>
              </>
            ) : (
              <>
                Stock: {alert.currentStock} / {alert.reorderLevel} min
              </>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getSeverityColor(alert.severity)}`}>
          {alert.type === 'overdue_rental' ? 'Overdue' : 'Low Stock'}
        </span>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  )
}
