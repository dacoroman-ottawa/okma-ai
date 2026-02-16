import { useMemo } from 'react'
import {
  CreditCard,
  MinusCircle,
  Sliders,
  Package,
  ChevronRight,
} from 'lucide-react'
import type { TransactionListProps, Transaction } from '../types'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getTransactionIcon(type: Transaction['type']) {
  switch (type) {
    case 'credit_purchase':
      return CreditCard
    case 'credit_deduction':
      return MinusCircle
    case 'credit_adjustment':
      return Sliders
    case 'inventory_payment':
      return Package
  }
}

function getTransactionLabel(type: Transaction['type']): string {
  switch (type) {
    case 'credit_purchase':
      return 'Credit Purchase'
    case 'credit_deduction':
      return 'Class Attended'
    case 'credit_adjustment':
      return 'Adjustment'
    case 'inventory_payment':
      return 'Inventory'
  }
}

function getTransactionColor(type: Transaction['type']): string {
  switch (type) {
    case 'credit_purchase':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'credit_deduction':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    case 'credit_adjustment':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'inventory_payment':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
  }
}

export function TransactionList({
  transactions,
  students,
  teachers,
  instruments,
  enrollments,
  onViewTransaction,
}: TransactionListProps) {
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [transactions])

  const getStudentName = (id: string) =>
    students.find((s) => s.id === id)?.name ?? 'Unknown Student'

  const getEnrollmentInfo = (enrollmentId: string | null) => {
    if (!enrollmentId) return null
    const enrollment = enrollments.find((e) => e.id === enrollmentId)
    if (!enrollment) return null
    const teacher = teachers.find((t) => t.id === enrollment.teacherId)
    const instrument = instruments.find((i) => i.id === enrollment.instrumentId)
    return {
      teacher: teacher?.name ?? 'Unknown',
      instrument: instrument?.name ?? 'Unknown',
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <CreditCard className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
          No transactions yet
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Transactions will appear here when credits are purchased or classes are attended.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Details
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Credits
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Amount
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedTransactions.map((txn) => {
              const Icon = getTransactionIcon(txn.type)
              const enrollmentInfo = getEnrollmentInfo(txn.enrollmentId)

              return (
                <tr
                  key={txn.id}
                  onClick={() => onViewTransaction?.(txn.id)}
                  className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(txn.date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getTransactionColor(txn.type)}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {getTransactionLabel(txn.type)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {getStudentName(txn.studentId)}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {enrollmentInfo ? (
                      <span>
                        {enrollmentInfo.instrument} with {enrollmentInfo.teacher}
                      </span>
                    ) : txn.lineItems ? (
                      <span>
                        {txn.lineItems.length} item
                        {txn.lineItems.length !== 1 ? 's' : ''}
                      </span>
                    ) : txn.note ? (
                      <span className="line-clamp-1">{txn.note}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                    {txn.credits !== 0 ? (
                      <span
                        className={
                          txn.credits > 0
                            ? 'font-medium text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }
                      >
                        {txn.credits > 0 ? '+' : ''}
                        {txn.credits}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                    {txn.totalAmount > 0 ? (
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(txn.totalAmount)}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="divide-y divide-slate-200 md:hidden dark:divide-slate-700">
        {sortedTransactions.map((txn) => {
          const Icon = getTransactionIcon(txn.type)
          const enrollmentInfo = getEnrollmentInfo(txn.enrollmentId)

          return (
            <div
              key={txn.id}
              onClick={() => onViewTransaction?.(txn.id)}
              className="cursor-pointer p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-lg p-2 ${getTransactionColor(txn.type)}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {getStudentName(txn.studentId)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {getTransactionLabel(txn.type)}
                      {enrollmentInfo && (
                        <> &middot; {enrollmentInfo.instrument}</>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(txn.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {txn.credits !== 0 && (
                    <p
                      className={`text-sm font-medium ${
                        txn.credits > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {txn.credits > 0 ? '+' : ''}
                      {txn.credits} credit{Math.abs(txn.credits) !== 1 ? 's' : ''}
                    </p>
                  )}
                  {txn.totalAmount > 0 && (
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(txn.totalAmount)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
