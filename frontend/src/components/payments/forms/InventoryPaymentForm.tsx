
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { InventoryPaymentFormProps, LineItem, TaxType, PaymentMethod } from '../../../types/payments'

export function InventoryPaymentForm({
    customers,
    onSubmit,
    onCancel,
}: InventoryPaymentFormProps) {
    const [customerId, setCustomerId] = useState('')
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { description: '', quantity: 1, unitPrice: 0 },
    ])
    const [discountAmount, setDiscountAmount] = useState<number>(0)
    const [discountNote, setDiscountNote] = useState('')
    const [taxType, setTaxType] = useState<TaxType>('HST')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')

    // Calculations
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const taxableAmount = Math.max(0, subtotal - discountAmount)
    const taxRate = taxType === 'HST' ? 0.13 : taxType === 'GST' ? 0.05 : 0
    const taxAmount = taxableAmount * taxRate
    const totalAmount = taxableAmount + taxAmount

    const handleAddItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }])
    }

    const handleRemoveItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...lineItems]
        newItems[index] = { ...newItems[index], [field]: value }
        setLineItems(newItems)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!customerId || lineItems.length === 0 || !paymentMethod) return

        // Validate items
        if (lineItems.some(i => !i.description || i.quantity <= 0 || i.unitPrice < 0)) {
            alert("Please check line items")
            return
        }

        onSubmit?.({
            customerId,
            lineItems,
            discountAmount,
            discountNote: discountNote || null,
            taxType,
            paymentMethod: paymentMethod as PaymentMethod,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Customer (Student)
                </label>
                <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                    required
                >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Line Items */}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Line Items
                    </label>
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                    >
                        <Plus className="h-3 w-3" />
                        Add Item
                    </button>
                </div>

                <div className="space-y-2">
                    {lineItems.map((item, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="flex-grow">
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                                    required
                                />
                            </div>
                            <div className="w-20">
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                                    required
                                />
                            </div>
                            <div className="w-24">
                                <input
                                    type="number"
                                    placeholder="Price"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                disabled={lineItems.length === 1}
                                className="mt-1 p-1 text-slate-400 hover:text-red-500 disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Discount */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Discount ($)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={discountAmount || ''}
                        onChange={(e) => setDiscountAmount(parseFloat(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Discount Note
                    </label>
                    <input
                        type="text"
                        value={discountNote}
                        onChange={(e) => setDiscountNote(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                        placeholder="Reason"
                    />
                </div>
            </div>

            {/* Tax & Payment Method */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Tax Type
                    </label>
                    <select
                        value={taxType}
                        onChange={(e) => setTaxType(e.target.value as TaxType)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                    >
                        <option value="HST">HST (13%)</option>
                        <option value="GST">GST (5%)</option>
                        <option value="None">None</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Payment Method
                    </label>
                    <select
                        value={paymentMethod ?? ''}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                        required
                    >
                        <option value="">Select Method</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit">Debit</option>
                        <option value="Cash">Cash</option>
                        <option value="E-Transfer">E-Transfer</option>
                    </select>
                </div>
            </div>

            {/* Summary */}
            <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax ({taxRate * 100}%):</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-bold dark:border-slate-700">
                    <span className="text-slate-900 dark:text-slate-100">Total:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">${totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Process Payment
                </button>
            </div>
        </form>
    )
}
