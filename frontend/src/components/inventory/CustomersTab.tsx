import { useState, useMemo } from 'react'
import {
  Plus,
  Users,
  Mail,
  Phone,
  MapPin,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
} from 'lucide-react'
import type { Customer, Rental } from '@/types/inventory'

interface CustomersTabProps {
  customers: Customer[]
  rentals: Rental[]
  onViewCustomer?: (id: string) => void
  onEditCustomer?: (id: string) => void
  onDeleteCustomer?: (id: string) => void
  onToggleCustomerStatus?: (id: string) => void
  onAddCustomer?: () => void
}

export function CustomersTab({
  customers,
  rentals,
  onViewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onToggleCustomerStatus,
  onAddCustomer,
}: CustomersTabProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const getActiveRentalsCount = (customerId: string) =>
    rentals.filter(
      (r) =>
        r.customerId === customerId &&
        (r.status === 'active' || r.status === 'overdue')
    ).length

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      // Active first, then by name
      if (a.active !== b.active) return a.active ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }, [customers])

  const activeCount = customers.filter((c) => c.active).length

  return (
    <div className="flex h-full flex-col">
      {/* Fixed header */}
      <div className="shrink-0 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Active Customers
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {activeCount}
              </p>
            </div>
            {customers.length > activeCount && (
              <>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Inactive
                  </p>
                  <p className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                    {customers.length - activeCount}
                  </p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onAddCustomer}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Scrollable customers grid */}
      <div className="min-h-0 flex-1 overflow-y-auto">
      {sortedCustomers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
            No customers yet
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Add your first customer to track rentals and purchases.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCustomers.map((customer) => {
            const activeRentals = getActiveRentalsCount(customer.id)
            const isMenuOpen = openMenuId === customer.id

            return (
              <div
                key={customer.id}
                onClick={() => onViewCustomer?.(customer.id)}
                className={`relative cursor-pointer rounded-xl border bg-white p-5 transition-all hover:shadow-md dark:bg-slate-900 ${
                  customer.active
                    ? 'border-slate-200 dark:border-slate-700'
                    : 'border-slate-200 opacity-70 dark:border-slate-700'
                }`}
              >
                {/* Header with avatar and menu */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {customer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {customer.name}
                        </h3>
                        {activeRentals > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                            <Clock className="h-3 w-3" />
                            {activeRentals}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(isMenuOpen ? null : customer.id)
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
                        <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(null)
                              onEditCustomer?.(customer.id)
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit Customer
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(null)
                              onToggleCustomerStatus?.(customer.id)
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Power className="h-4 w-4" />
                            {customer.active ? 'Deactivate Customer' : 'Activate Customer'}
                          </button>
                          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(null)
                              if (confirm(`Delete ${customer.name}?`)) {
                                onDeleteCustomer?.(customer.id)
                              }
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Customer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="line-clamp-2">{customer.address}</span>
                  </div>
                </div>

                {/* Status in footer */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      customer.active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        customer.active ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {customer.active ? 'Active' : 'Inactive'}
                  </span>
                  {customer.notes && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[50%]">
                      {customer.notes}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        )}
      </div>
    </div>
  )
}
