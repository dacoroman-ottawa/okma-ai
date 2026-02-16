import { useState, useMemo } from 'react'
import {
  Plus,
  List,
  Wallet,
  CreditCard,
  Sliders,
  Package,
  ChevronDown,
} from 'lucide-react'
import type { PaymentsProps, TransactionType } from '../types'
import { TransactionList } from './TransactionList'
import { StudentBalances } from './StudentBalances'

type TabType = 'transactions' | 'balances'
type FilterType = TransactionType | 'all'

export function PaymentsView({
  transactions,
  balances,
  students,
  teachers,
  instruments,
  enrollments,
  onViewTransaction,
  onViewStudentHistory,
  onAddCreditPurchase,
  onAddAdjustment,
  onAddInventoryPayment,
  onAddCreditsForStudent,
}: PaymentsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('transactions')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [studentFilter, setStudentFilter] = useState<string | null>(null)
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      if (typeFilter !== 'all' && txn.type !== typeFilter) {
        return false
      }
      if (studentFilter && txn.studentId !== studentFilter) {
        return false
      }
      return true
    })
  }, [transactions, typeFilter, studentFilter])

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalRevenue = transactions
      .filter((t) => t.totalAmount > 0)
      .reduce((sum, t) => sum + t.totalAmount, 0)
    const totalCredits = balances.reduce((sum, b) => sum + b.currentBalance, 0)
    const lowBalanceCount = balances.filter((b) => b.currentBalance <= 2).length

    return { totalRevenue, totalCredits, lowBalanceCount }
  }, [transactions, balances])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Payments
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {transactions.length} transactions, {balances.length} active
              enrollments
            </p>
          </div>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              New Payment
              <ChevronDown className="h-4 w-4" />
            </button>

            {showActionsMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActionsMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <button
                    onClick={() => {
                      setShowActionsMenu(false)
                      onAddCreditPurchase?.()
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <CreditCard className="h-4 w-4 text-emerald-500" />
                    Credit Purchase
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsMenu(false)
                      onAddAdjustment?.()
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Sliders className="h-4 w-4 text-amber-500" />
                    Credit Adjustment
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsMenu(false)
                      onAddInventoryPayment?.()
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Package className="h-4 w-4 text-indigo-500" />
                    Inventory Payment
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Revenue
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Outstanding Credits
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.totalCredits}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Low Balance Alerts
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${
                stats.lowBalanceCount > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {stats.lowBalanceCount}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <List className="h-4 w-4" />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'balances'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Wallet className="h-4 w-4" />
              Balances
            </button>
          </div>

          {/* Filters (only show for transactions tab) */}
          {activeTab === 'transactions' && (
            <div className="flex flex-wrap gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
              >
                <option value="all">All Types</option>
                <option value="credit_purchase">Credit Purchases</option>
                <option value="credit_deduction">Class Attended</option>
                <option value="credit_adjustment">Adjustments</option>
                <option value="inventory_payment">Inventory</option>
              </select>

              <select
                value={studentFilter ?? ''}
                onChange={(e) =>
                  setStudentFilter(e.target.value || null)
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
              >
                <option value="">All Students</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Filter count */}
        {activeTab === 'transactions' &&
          (typeFilter !== 'all' || studentFilter) && (
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredTransactions.length} of {transactions.length}{' '}
              transactions
            </p>
          )}

        {/* Content */}
        {activeTab === 'transactions' ? (
          <TransactionList
            transactions={filteredTransactions}
            students={students}
            teachers={teachers}
            instruments={instruments}
            enrollments={enrollments}
            onViewTransaction={onViewTransaction}
          />
        ) : (
          <StudentBalances
            balances={balances}
            students={students}
            teachers={teachers}
            instruments={instruments}
            onViewStudentHistory={onViewStudentHistory}
            onAddCredits={onAddCreditsForStudent}
          />
        )}
      </div>
    </div>
  )
}
