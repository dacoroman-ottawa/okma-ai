import { useState, useMemo } from 'react'
import {
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  ChevronRight,
} from 'lucide-react'
import type { Rental, Product, Customer, RentalStatus } from '../types'

interface RentalsTabProps {
  rentals: Rental[]
  products: Product[]
  customers: Customer[]
  onViewRental?: (id: string) => void
  onReturnRental?: (id: string) => void
  onCreateRental?: () => void
}

const statusConfig: Record<
  RentalStatus,
  { label: string; icon: typeof Clock; color: string }
> = {
  active: {
    label: 'Active',
    icon: Clock,
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  },
  overdue: {
    label: 'Overdue',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  returned: {
    label: 'Returned',
    icon: CheckCircle,
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
}

type StatusFilter = RentalStatus | 'all'

export function RentalsTab({
  rentals,
  products,
  customers,
  onViewRental,
  onReturnRental,
  onCreateRental,
}: RentalsTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const getProductName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? 'Unknown Product'

  const getCustomerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? 'Unknown Customer'

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)

  const filteredRentals = useMemo(() => {
    return rentals
      .filter((rental) => {
        if (statusFilter !== 'all' && rental.status !== statusFilter) return false
        return true
      })
      .sort((a, b) => {
        // Sort: overdue first, then active, then returned
        const order = { overdue: 0, active: 1, returned: 2 }
        if (order[a.status] !== order[b.status]) {
          return order[a.status] - order[b.status]
        }
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
  }, [rentals, statusFilter])

  const activeCount = rentals.filter((r) => r.status === 'active').length
  const overdueCount = rentals.filter((r) => r.status === 'overdue').length

  return (
    <div className="space-y-6">
      {/* Stats and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setStatusFilter(statusFilter === 'all' ? 'all' : 'all')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            All ({rentals.length})
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
            }`}
          >
            Active ({activeCount})
          </button>
          {overdueCount > 0 && (
            <button
              onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Overdue ({overdueCount})
              </span>
            </button>
          )}
        </div>

        <button
          onClick={onCreateRental}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New Rental
        </button>
      </div>

      {/* Rentals list */}
      {filteredRentals.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <Clock className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
            No rentals found
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {statusFilter !== 'all'
              ? 'No rentals match this filter'
              : 'Create a rental to get started'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Fee
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredRentals.map((rental) => {
                  const config = statusConfig[rental.status]
                  const StatusIcon = config.icon

                  return (
                    <tr
                      key={rental.id}
                      onClick={() => onViewRental?.(rental.id)}
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {getProductName(rental.productId)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {getCustomerName(rental.customerId)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="capitalize">{rental.rentalPeriod}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        {rental.returnDate ? (
                          <span className="text-slate-400 dark:text-slate-500">
                            Returned {formatDate(rental.returnDate)}
                          </span>
                        ) : (
                          <span
                            className={
                              rental.status === 'overdue'
                                ? 'font-medium text-red-600 dark:text-red-400'
                                : 'text-slate-900 dark:text-slate-100'
                            }
                          >
                            {formatDate(rental.dueDate)}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {config.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(rental.rentalFee)}
                        </p>
                        {rental.lateFee > 0 && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            +{formatCurrency(rental.lateFee)} late
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {rental.status === 'active' || rental.status === 'overdue' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onReturnRental?.(rental.id)
                            }}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                            title="Mark as returned"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="divide-y divide-slate-200 md:hidden dark:divide-slate-700">
            {filteredRentals.map((rental) => {
              const config = statusConfig[rental.status]
              const StatusIcon = config.icon

              return (
                <div
                  key={rental.id}
                  onClick={() => onViewRental?.(rental.id)}
                  className="cursor-pointer p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {getProductName(rental.productId)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {getCustomerName(rental.customerId)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          Due {formatDate(rental.dueDate)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(rental.rentalFee)}
                      </p>
                      {rental.lateFee > 0 && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          +{formatCurrency(rental.lateFee)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
