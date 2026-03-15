import { useState, useMemo } from 'react'
import {
  Plus,
  Truck,
  Mail,
  Phone,
  MapPin,
  Package,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
} from 'lucide-react'
import type { Supplier, Product } from '@/types/inventory'

interface SuppliersTabProps {
  suppliers: Supplier[]
  products: Product[]
  onViewSupplier?: (id: string) => void
  onEditSupplier?: (id: string) => void
  onDeleteSupplier?: (id: string) => void
  onToggleSupplierStatus?: (id: string) => void
  onAddSupplier?: () => void
}

export function SuppliersTab({
  suppliers,
  products,
  onViewSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onToggleSupplierStatus,
  onAddSupplier,
}: SuppliersTabProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

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
    <div className="flex h-full flex-col">
      {/* Fixed header */}
      <div className="shrink-0 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {activeCount} active supplier{activeCount !== 1 ? 's' : ''}
            {suppliers.length > activeCount && ` (${suppliers.length - activeCount} inactive)`}
          </p>

          <button
            onClick={onAddSupplier}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* Scrollable suppliers grid */}
      <div className="min-h-0 flex-1 overflow-y-auto">
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
            const isMenuOpen = openMenuId === supplier.id

            return (
              <div
                key={supplier.id}
                onClick={() => onViewSupplier?.(supplier.id)}
                className={`relative cursor-pointer rounded-xl border bg-white p-5 transition-all hover:shadow-md dark:bg-slate-900 ${
                  supplier.active
                    ? 'border-slate-200 dark:border-slate-700'
                    : 'border-slate-200 opacity-70 dark:border-slate-700'
                }`}
              >
                {/* Header with icon and menu */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                      <Truck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
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

                  {/* Menu button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(isMenuOpen ? null : supplier.id)
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
                              onEditSupplier?.(supplier.id)
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit Supplier
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              const supplierId = supplier.id
                              setOpenMenuId(null)
                              onToggleSupplierStatus?.(supplierId)
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Power className="h-4 w-4" />
                            {supplier.active ? 'Deactivate Supplier' : 'Activate Supplier'}
                          </button>
                          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(null)
                              if (confirm(`Delete ${supplier.name}?`)) {
                                onDeleteSupplier?.(supplier.id)
                              }
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Supplier
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Contact info */}
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

                {/* Status and product count in footer */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      supplier.active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        supplier.active ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {supplier.active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Package className="h-4 w-4" />
                    <span>
                      {productCount} product{productCount !== 1 ? 's' : ''}
                    </span>
                  </div>
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
