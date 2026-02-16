import { useMemo } from 'react'
import {
  Plus,
  Users,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Clock,
} from 'lucide-react'
import type { Customer, Rental } from '../types'

interface CustomersTabProps {
  customers: Customer[]
  rentals: Rental[]
  onViewCustomer?: (id: string) => void
  onEditCustomer?: (id: string) => void
  onAddCustomer?: () => void
}

export function CustomersTab({
  customers,
  rentals,
  onViewCustomer,
  onEditCustomer,
  onAddCustomer,
}: CustomersTabProps) {
  const getActiveRentalsCount = (customerId: string) =>
    rentals.filter(
      (r) =>
        r.customerId === customerId &&
        (r.status === 'active' || r.status === 'overdue')
    ).length

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => a.name.localeCompare(b.name))
  }, [customers])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </p>

        <button
          onClick={onAddCustomer}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Customers grid */}
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

            return (
              <div
                key={customer.id}
                onClick={() => onViewCustomer?.(customer.id)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {customer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {customer.name}
                      </h3>
                      {customer.notes && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {customer.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  {activeRentals > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      <Clock className="h-3 w-3" />
                      {activeRentals}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="line-clamp-2">{customer.address}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
