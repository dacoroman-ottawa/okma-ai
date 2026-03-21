"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Rental, Product, Customer, RentalPeriod, RentalStatus } from "@/types/inventory"

interface RentalFormModalProps {
  rental: Rental | null
  products: Product[]
  customers: Customer[]
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Rental>) => Promise<boolean>
}

const emptyRental: Partial<Rental> = {
  productId: "",
  customerId: "",
  rentalPeriod: "monthly",
  startDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  deposit: 0,
  rentalFee: 0,
  lateFee: 0,
  status: "active",
  returnDate: null,
  conditionNotes: "",
}

function calculateDueDate(startDate: string, period: RentalPeriod): string {
  const start = new Date(startDate)
  if (period === "weekly") {
    start.setDate(start.getDate() + 7)
  } else {
    start.setMonth(start.getMonth() + 1)
  }
  return start.toISOString().split("T")[0]
}

export function RentalFormModal({
  rental,
  products,
  customers,
  isOpen,
  onClose,
  onSave,
}: RentalFormModalProps) {
  const [formData, setFormData] = useState<Partial<Rental>>(emptyRental)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = rental !== null

  // Filter products that can be rented (have rental price and are active)
  const rentableProducts = products.filter(
    (p) => p.active && p.rentalPrice && p.rentalPrice > 0 && p.stockQuantity > 0
  )

  // Filter active customers
  const activeCustomers = customers.filter((c) => c.active)

  useEffect(() => {
    if (isOpen) {
      if (rental) {
        setFormData({
          productId: rental.productId,
          customerId: rental.customerId,
          rentalPeriod: rental.rentalPeriod,
          startDate: rental.startDate.split("T")[0],
          dueDate: rental.dueDate.split("T")[0],
          deposit: rental.deposit,
          rentalFee: rental.rentalFee,
          lateFee: rental.lateFee,
          status: rental.status,
          returnDate: rental.returnDate ? rental.returnDate.split("T")[0] : null,
          conditionNotes: rental.conditionNotes || "",
        })
      } else {
        const today = new Date().toISOString().split("T")[0]
        setFormData({
          ...emptyRental,
          startDate: today,
          dueDate: calculateDueDate(today, "monthly"),
        })
      }
      setError(null)
    }
  }, [isOpen, rental])

  // Auto-calculate due date when start date or period changes
  useEffect(() => {
    if (formData.startDate && formData.rentalPeriod && !isEditing) {
      setFormData((prev) => ({
        ...prev,
        dueDate: calculateDueDate(prev.startDate!, prev.rentalPeriod!),
      }))
    }
  }, [formData.startDate, formData.rentalPeriod, isEditing])

  // Auto-fill rental fee from product
  useEffect(() => {
    if (formData.productId && !isEditing) {
      const product = products.find((p) => p.id === formData.productId)
      if (product?.rentalPrice) {
        setFormData((prev) => ({
          ...prev,
          rentalFee: product.rentalPrice!,
          deposit: product.rentalPrice!, // Default deposit equals one period's fee
        }))
      }
    }
  }, [formData.productId, products, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const success = await onSave(formData)
      if (success) {
        onClose()
      } else {
        setError("Failed to save rental")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rental")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {isEditing ? "Edit Rental" : "New Rental"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Product */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Product *
              </label>
              <select
                required
                value={formData.productId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, productId: e.target.value }))
                }
                disabled={isEditing}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-700"
              >
                <option value="">Select a product</option>
                {rentableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.model ? `(${product.model})` : ""} - ${product.rentalPrice}/mo
                  </option>
                ))}
              </select>
              {isEditing && (
                <p className="mt-1 text-xs text-slate-500">Product cannot be changed after creation</p>
              )}
            </div>

            {/* Customer */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Customer *
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, customerId: e.target.value }))
                }
                disabled={isEditing}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-700"
              >
                <option value="">Select a customer</option>
                {activeCustomers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {isEditing && (
                <p className="mt-1 text-xs text-slate-500">Customer cannot be changed after creation</p>
              )}
            </div>

            {/* Rental Period */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Rental Period *
              </label>
              <select
                required
                value={formData.rentalPeriod}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rentalPeriod: e.target.value as RentalPeriod,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Fees Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Rental Fee */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Rental Fee *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.rentalFee}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rentalFee: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Deposit */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Deposit *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.deposit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deposit: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Edit-only fields: Late Fee, Status, Return Date */}
            {isEditing && (
              <>
                {/* Late Fee and Status Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Late Fee */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Late Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.lateFee || 0}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            lateFee: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as RentalStatus
                        const today = new Date().toISOString().split('T')[0]
                        setFormData((prev) => ({
                          ...prev,
                          status: newStatus,
                          // Set return date to today when changing to returned, clear when changing away
                          returnDate: newStatus === 'returned' ? (prev.returnDate || today) : null,
                        }))
                      }}
                      className="h-[38px] w-full rounded-lg border border-slate-300 px-3 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="active">Active</option>
                      <option value="overdue">Overdue</option>
                      <option value="returned">Returned</option>
                    </select>
                  </div>
                </div>

                {/* Return Date */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Return Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.returnDate ?? ""}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          returnDate: e.target.value || null,
                        }))
                      }
                      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 ${formData.returnDate ? 'text-slate-900 dark:text-slate-100' : 'text-transparent'}`}
                    />
                    {!formData.returnDate && (
                      <span className="pointer-events-none absolute inset-0 flex items-center px-3 text-sm text-slate-400 dark:text-slate-500">
                        Not returned
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Leave empty if not yet returned</p>
                </div>
              </>
            )}

            {/* Condition Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Condition Notes
              </label>
              <textarea
                value={formData.conditionNotes || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, conditionNotes: e.target.value }))
                }
                placeholder="Note the condition of the item at time of rental"
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Rental"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
