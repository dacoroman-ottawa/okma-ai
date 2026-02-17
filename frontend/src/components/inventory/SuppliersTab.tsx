import { useMemo } from 'react'
import {
  Plus,
  Truck,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Package,
} from 'lucide-react'
import type { Supplier, Product } from '../types'

interface SuppliersTabProps {
  suppliers: Supplier[]
  products: Product[]
  onViewSupplier?: (id: string) => void
  onEditSupplier?: (id: string) => void
  onAddSupplier?: () => void
}

export function SuppliersTab({
  suppliers,
  products,
  onViewSupplier,
  onEditSupplier,
  onAddSupplier,
}: SuppliersTabProps) {
  const getProductCount = (supplierId: string) =>
    products.filter((p) => p.supplierId === supplierId && p.active).length

  const sortedSuppliers = useMemo(() => {
    return [...suppliers].sort((a, b) => {
      // Active first, then by name
      if (a.active !== b.active) return a.active ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }, [suppliers])

  const activeCount = suppliers.filter((s) => s.active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {activeCount} active supplier{activeCount !== 1 ? 's' : ''}
        </p>

        <button
          onClick={onAddSupplier}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>

      {/* Suppliers grid */}
      {sortedSuppliers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <Truck className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
            No suppliers yet
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Add your first supplier to track where products come from.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedSuppliers.map((supplier) => {
            const productCount = getProductCount(supplier.id)

            return (
              <div
                key={supplier.id}
                onClick={() => onViewSupplier?.(supplier.id)}
                className={`cursor-pointer rounded-xl border bg-white p-5 transition-all hover:shadow-md dark:bg-slate-900 ${
                  supplier.active
                    ? 'border-slate-200 dark:border-slate-700'
                    : 'border-slate-200 opacity-60 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                      <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {supplier.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {supplier.contactPerson}
                      </p>
                    </div>
                  </div>
                  {!supplier.active && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Package className="h-4 w-4" />
                    <span>
                      {productCount} product{productCount !== 1 ? 's' : ''}
                    </span>
                  </div>
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
