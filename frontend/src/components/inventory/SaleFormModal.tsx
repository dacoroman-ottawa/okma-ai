"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Sale, Product, Customer, PaymentMethod } from "@/types/inventory"

interface SaleFormModalProps {
  sale: Sale | null
  products: Product[]
  customers: Customer[]
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Sale>) => Promise<boolean>
}

const paymentMethods: PaymentMethod[] = ["Credit Card", "Debit", "Cash", "E-Transfer"]

const emptySale: Partial<Sale> = {
  productId: "",
  customerId: "",
  date: new Date().toISOString().split("T")[0],
  quantity: 1,
  unitPrice: 0,
  totalAmount: 0,
  paymentMethod: "Credit Card",
}

export function SaleFormModal({
  sale,
  products,
  customers,
  isOpen,
  onClose,
  onSave,
}: SaleFormModalProps) {
  const [formData, setFormData] = useState<Partial<Sale>>(emptySale)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = sale !== null

  // Filter active products with stock
  const availableProducts = products.filter(
    (p) => p.active && p.stockQuantity > 0
  )

  // Filter active customers
  const activeCustomers = customers.filter((c) => c.active)

  useEffect(() => {
    if (isOpen) {
      if (sale) {
        setFormData({
          productId: sale.productId,
          customerId: sale.customerId,
          date: sale.date.split("T")[0],
          quantity: sale.quantity,
          unitPrice: sale.unitPrice,
          totalAmount: sale.totalAmount,
          paymentMethod: sale.paymentMethod,
        })
      } else {
        setFormData({
          ...emptySale,
          date: new Date().toISOString().split("T")[0],
        })
      }
      setError(null)
    }
  }, [isOpen, sale])

  // Auto-fill unit price from product
  useEffect(() => {
    if (formData.productId && !isEditing) {
      const product = products.find((p) => p.id === formData.productId)
      if (product) {
        setFormData((prev) => ({
          ...prev,
          unitPrice: product.sellingPrice,
          totalAmount: product.sellingPrice * (prev.quantity || 1),
        }))
      }
    }
  }, [formData.productId, products, isEditing])

  // Auto-calculate total amount when quantity or unit price changes
  useEffect(() => {
    setFormData((prev) => {
      const quantity = prev.quantity || 0
      const unitPrice = prev.unitPrice || 0
      const newTotal = quantity * unitPrice
      if (prev.totalAmount === newTotal) return prev
      return { ...prev, totalAmount: newTotal }
    })
  }, [formData.quantity, formData.unitPrice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const success = await onSave(formData)
      if (success) {
        onClose()
      } else {
        setError("Failed to save sale")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sale")
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
            {isEditing ? "Edit Sale" : "New Sale"}
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
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.model ? `(${product.model})` : ""} - ${product.sellingPrice}
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

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Quantity and Unit Price Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Unit Price */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Unit Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        unitPrice: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Total Amount (read-only) */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Total Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
                <input
                  type="number"
                  readOnly
                  value={formData.totalAmount?.toFixed(2)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-7 pr-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment Method *
              </label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value as PaymentMethod,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
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
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
