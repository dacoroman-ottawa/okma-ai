
import { useState, useEffect } from 'react'
import type { CreditPurchaseFormProps, TaxType, PaymentMethod } from '../../../types/payments'

export function CreditPurchaseForm({
    students,
    enrollments,
    teachers,
    instruments,
    onSubmit,
    onCancel,
}: CreditPurchaseFormProps) {
    const [studentId, setStudentId] = useState('')
    const [enrollmentId, setEnrollmentId] = useState('')
    const [credits, setCredits] = useState<number>(0)
    const [discountAmount, setDiscountAmount] = useState<number>(0)
    const [discountNote, setDiscountNote] = useState('')
    const [taxType, setTaxType] = useState<TaxType>('HST')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')

    // Filter enrollments for selected student
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId)

    // Auto-select first enrollment if only one
    useEffect(() => {
        if (studentEnrollments.length === 1) {
            setEnrollmentId(studentEnrollments[0].id)
        } else {
            setEnrollmentId('')
        }
    }, [studentId])

    // Calculate totals for preview
    const selectedEnrollment = enrollments.find(e => e.id === enrollmentId)
    const teacher = selectedEnrollment ? teachers.find(t => t.id === selectedEnrollment.teacherId) : null
    const hourlyRate = teacher?.hourlyRate || 0

    const subtotal = credits * hourlyRate
    const taxableAmount = Math.max(0, subtotal - discountAmount)
    const taxRate = taxType === 'HST' ? 0.13 : taxType === 'GST' ? 0.05 : 0
    const taxAmount = taxableAmount * taxRate
    const totalAmount = taxableAmount + taxAmount

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!studentId || !enrollmentId || credits <= 0 || !paymentMethod) return

        onSubmit?.({
            studentId,
            enrollmentId,
            credits,
            discountAmount,
            discountNote: discountNote || null,
            taxType,
            paymentMethod: paymentMethod as PaymentMethod,
        })
    }

    const getInstrumentName = (id: string) => instruments.find(i => i.id === id)?.name || 'Unknown'
    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'Unknown'

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Student
                </label>
                <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                    required
                >
                    <option value="">Select Student</option>
                    {students.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {/* Enrollment Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Enrollment
                </label>
                <select
                    value={enrollmentId}
                    onChange={(e) => setEnrollmentId(e.target.value)}
                    disabled={!studentId}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700 disabled:opacity-50"
                    required
                >
                    <option value="">Select Enrollment</option>
                    {studentEnrollments.map((e) => (
                        <option key={e.id} value={e.id}>
                            {getInstrumentName(e.instrumentId)} with {getTeacherName(e.teacherId)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Credits & Rate */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Credits
                    </label>
                    <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={credits || ''}
                        onChange={(e) => setCredits(parseFloat(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Rate / Credit
                    </label>
                    <div className="mt-1 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 rounded-md">
                        ${hourlyRate.toFixed(2)}
                    </div>
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
