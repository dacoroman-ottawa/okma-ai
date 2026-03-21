import { useState, useMemo } from 'react'
import {
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react'
import type { Rental, Product, Customer, RentalStatus } from '@/types/inventory'

interface RentalsTabProps {
  rentals: Rental[]
  products: Product[]
  customers: Customer[]
  onViewRental?: (id: string) => void
  onEditRental?: (id: string) => void
  onDeleteRental?: (id: string) => void
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
  onEditRental,
  onDeleteRental,
  onReturnRental,
  onCreateRental,
}: RentalsTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const getProductName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? 'Unknown Product'

  const getCustomerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? 'Unknown Customer'

  const formatDate = (dateString: string) => {
    // Parse date string as local date to avoid timezone shifts
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)

  const filteredRentals = useMemo(() => {
    return rentals
      .filter((rental) => {
        if (searchQuery) {
          const productName = (products.find((p) => p.id === rental.productId)?.name ?? '').toLowerCase()
          const customerName = (customers.find((c) => c.id === rental.customerId)?.name ?? '').toLowerCase()
          const query = searchQuery.toLowerCase()
          if (!productName.includes(query) && !customerName.includes(query)) {
            return false
          }
        }
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
  }, [rentals, statusFilter, searchQuery, products, customers])

  const activeCount = rentals.filter((r) => r.status === 'active').length
  const overdueCount = rentals.filter((r) => r.status === 'overdue').length

  return (
    <div className="flex h-full flex-col">
      {/* Fixed header */}
      <div className="shrink-0 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search rentals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
      </div>

      {/* Scrollable rentals list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
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
                    Start Date
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
                {filteredRentals.map((rental, index) => {
                  const config = statusConfig[rental.status]
                  const StatusIcon = config.icon
                  const isMenuOpen = openMenuId === rental.id
                  const isNearBottom = index >= filteredRentals.length - 2

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
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(rental.startDate)}
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
                        <div className="relative flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(isMenuOpen ? null : rental.id)
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
                                  setOpenMenuId(null)
                                }}
                              />
                              <div className={`absolute right-0 z-20 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 ${
                                isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'
                              }`}>
                                {(rental.status === 'active' || rental.status === 'overdue') && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setOpenMenuId(null)
                                        if (confirm(`Mark this rental as returned?`)) {
                                          onReturnRental?.(rental.id)
                                        }
                                      }}
                                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                      Return Rental
                                    </button>
                                    <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                                  </>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenMenuId(null)
                                    onEditRental?.(rental.id)
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit Rental
                                </button>
                                <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenMenuId(null)
                                    if (confirm(`Delete this rental for ${getProductName(rental.productId)}?`)) {
                                      onDeleteRental?.(rental.id)
                                    }
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Rental
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="divide-y divide-slate-200 md:hidden dark:divide-slate-700">
            {filteredRentals.map((rental, index) => {
              const config = statusConfig[rental.status]
              const StatusIcon = config.icon
              const isMenuOpen = openMenuId === rental.id
              const isNearBottom = index >= filteredRentals.length - 2

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
                    <div className="flex items-start gap-2">
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
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(isMenuOpen ? null : rental.id)
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
                                setOpenMenuId(null)
                              }}
                            />
                            <div className={`absolute right-0 z-20 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 ${
                              isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'
                            }`}>
                              {(rental.status === 'active' || rental.status === 'overdue') && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenMenuId(null)
                                      if (confirm(`Mark this rental as returned?`)) {
                                        onReturnRental?.(rental.id)
                                      }
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                    Return Rental
                                  </button>
                                  <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                                </>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuId(null)
                                  onEditRental?.(rental.id)
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit Rental
                              </button>
                              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuId(null)
                                  if (confirm(`Delete this rental for ${getProductName(rental.productId)}?`)) {
                                    onDeleteRental?.(rental.id)
                                  }
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Rental
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
