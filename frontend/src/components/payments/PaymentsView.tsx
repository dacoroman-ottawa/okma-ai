import { useState, useMemo } from 'react'
import {
  Plus,
  List,
  Wallet,
  CreditCard,
  Sliders,
  Package,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PaymentsProps, TransactionType, Transaction, StudentBalance } from '@/types/payments'
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
  onEditTransaction,
  onDeleteTransaction,
  onViewStudentHistory,
  onAddCreditPurchase,
  onAddAdjustment,
  onAddInventoryPayment,
  onAddCreditsForStudent,
}: PaymentsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('transactions')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [studentFilter, setStudentFilter] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      if (typeFilter !== 'all' && txn.type !== typeFilter) {
        return false
      }
      if (studentFilter && txn.studentId !== studentFilter) {
        return false
      }
      if (startDate) {
        const txnDate = new Date(txn.date)
        const filterStart = new Date(startDate)
        if (txnDate < filterStart) {
          return false
        }
      }
      if (endDate) {
        const txnDate = new Date(txn.date)
        const filterEnd = new Date(endDate)
        filterEnd.setHours(23, 59, 59, 999)
        if (txnDate > filterEnd) {
          return false
        }
      }
      return true
    })
  }, [transactions, typeFilter, studentFilter, startDate, endDate])

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

  const getStudentName = (id: string) =>
    students.find((s) => s.id === id)?.name ?? 'Unknown Student'

  const getTransactionLabel = (type: Transaction['type']): string => {
    switch (type) {
      case 'purchase':
        return 'Credit Purchase'
      case 'deduction':
        return 'Class Attended'
      case 'adjustment':
        return 'Adjustment'
      case 'inventory_payment':
        return 'Inventory'
      default:
        return 'Transaction'
    }
  }

  const formatDateForExport = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const exportToXLSX = () => {
    const data = filteredTransactions.map((txn) => ({
      Date: formatDateForExport(txn.date),
      Type: getTransactionLabel(txn.type),
      Student: getStudentName(txn.studentId),
      Credits: txn.credits,
      Amount: txn.totalAmount > 0 ? txn.totalAmount : '',
      Note: txn.note ?? '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')

    // Auto-size columns
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 15 }, // Type
      { wch: 20 }, // Student
      { wch: 8 },  // Credits
      { wch: 12 }, // Amount
      { wch: 30 }, // Note
    ]
    worksheet['!cols'] = colWidths

    XLSX.writeFile(workbook, `transactions-${new Date().toISOString().split('T')[0]}.xlsx`)
    setShowExportMenu(false)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Transactions Report', 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    const dateRange = startDate || endDate
      ? `${startDate || 'Start'} to ${endDate || 'Present'}`
      : 'All Time'
    doc.text(`Date Range: ${dateRange}`, 14, 30)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-CA')}`, 14, 36)

    const tableData = filteredTransactions.map((txn) => [
      formatDateForExport(txn.date),
      getTransactionLabel(txn.type),
      getStudentName(txn.studentId),
      txn.credits.toString(),
      txn.totalAmount > 0 ? formatCurrency(txn.totalAmount) : '—',
    ])

    autoTable(doc, {
      startY: 42,
      head: [['Date', 'Type', 'Student', 'Credits', 'Amount']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] },
    })

    doc.save(`transactions-${new Date().toISOString().split('T')[0]}.pdf`)
    setShowExportMenu(false)
  }

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-950">
      {/* Fixed header section */}
      <div className="shrink-0 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
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
                className={`mt-1 text-2xl font-bold ${stats.lowBalanceCount > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-900 dark:text-slate-100'
                  }`}
              >
                {stats.lowBalanceCount}
              </p>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'transactions'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
              >
                <List className="h-4 w-4" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('balances')}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'balances'
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
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                  className="h-[38px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
                >
                  <option value="all">All Types</option>
                  <option value="purchase">Credit Purchases</option>
                  <option value="deduction">Class Attended</option>
                  <option value="adjustment">Adjustments</option>
                  <option value="inventory_payment">Inventory</option>
                </select>

                <select
                  value={studentFilter ?? ''}
                  onChange={(e) =>
                    setStudentFilter(e.target.value || null)
                  }
                  className="h-[38px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
                >
                  <option value="">All Students</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-slate-500 dark:text-slate-400">From:</span>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' || e.key === 'Delete') {
                          setStartDate('')
                        }
                      }}
                      className={`rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 ${startDate ? 'text-slate-700 dark:text-slate-300' : 'text-transparent'}`}
                    />
                    {!startDate && (
                      <span className="pointer-events-none absolute inset-0 flex items-center px-3 text-sm text-slate-400 dark:text-slate-500">
                        &nbsp; , &nbsp; , &nbsp;
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-slate-500 dark:text-slate-400">To:</span>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' || e.key === 'Delete') {
                          setEndDate('')
                        }
                      }}
                      className={`rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 ${endDate ? 'text-slate-700 dark:text-slate-300' : 'text-transparent'}`}
                    />
                    {!endDate && (
                      <span className="pointer-events-none absolute inset-0 flex items-center px-3 text-sm text-slate-400 dark:text-slate-500">
                        &nbsp; , &nbsp; , &nbsp;
                      </span>
                    )}
                  </div>
                </div>

                {/* Export dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4" />
                    Export
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {showExportMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowExportMenu(false)}
                      />
                      <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        <button
                          onClick={exportToXLSX}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                          Export to XLSX
                        </button>
                        <button
                          onClick={exportToPDF}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <FileText className="h-4 w-4 text-red-500" />
                          Export to PDF
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Filter count */}
          {activeTab === 'transactions' &&
            (typeFilter !== 'all' || studentFilter || startDate || endDate) && (
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                Showing {filteredTransactions.length} of {transactions.length}{' '}
                transactions
              </p>
            )}
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          {activeTab === 'transactions' ? (
            <TransactionList
              transactions={filteredTransactions}
              students={students}
              teachers={teachers}
              instruments={instruments}
              enrollments={enrollments}
              onViewTransaction={onViewTransaction}
              onEditTransaction={onEditTransaction}
              onDeleteTransaction={onDeleteTransaction}
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
    </div>
  )
}
