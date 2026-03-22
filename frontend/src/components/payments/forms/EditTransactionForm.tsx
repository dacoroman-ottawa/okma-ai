import { useState, useMemo, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { jsPDF } from 'jspdf'
import type { Transaction, TaxType, PaymentMethod } from '@/types/payments'

interface EditTransactionFormProps {
  transaction?: Transaction | null
  mode?: 'edit' | 'create'
  students: Array<{ id: string; name: string }>
  enrollments: Array<{ id: string; studentId: string; teacherId: string; instrumentId: string }>
  teachers: Array<{ id: string; name: string; hourlyRate?: number }>
  instruments: Array<{ id: string; name: string }>
  onSubmit?: (data: {
    studentId?: string
    enrollmentId?: string
    credits?: number
    note?: string
    paymentMethod?: PaymentMethod
    discountAmount?: number
    discountNote?: string | null
    taxType?: TaxType
  }) => void
  onCancel?: () => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount)
}

export function EditTransactionForm({
  transaction,
  mode = 'edit',
  students,
  enrollments,
  teachers,
  instruments,
  onSubmit,
  onCancel,
}: EditTransactionFormProps) {
  const isCreateMode = mode === 'create'
  const isEditMode = mode === 'edit'

  const [studentId, setStudentId] = useState(transaction?.studentId || '')
  const [enrollmentId, setEnrollmentId] = useState(transaction?.enrollmentId || '')
  const [credits, setCredits] = useState(transaction?.credits || 0)
  const [note, setNote] = useState(transaction?.note || '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(transaction?.paymentMethod || null)
  const [discountAmount, setDiscountAmount] = useState(transaction?.discountAmount || 0)
  const [discountNote, setDiscountNote] = useState('')
  const [taxType, setTaxType] = useState<TaxType>(transaction?.taxType || 'HST')

  const isAdjustment = transaction?.type === 'adjustment'
  const isPurchase = transaction?.type === 'purchase' || isCreateMode
  const isInventoryPayment = transaction?.type === 'inventory_payment'

  // Filter enrollments for selected student
  const studentEnrollments = enrollments.filter(e => e.studentId === studentId)

  // Auto-select first enrollment if only one (create mode)
  useEffect(() => {
    if (isCreateMode && studentEnrollments.length === 1) {
      setEnrollmentId(studentEnrollments[0].id)
    } else if (isCreateMode && studentEnrollments.length !== 1) {
      setEnrollmentId('')
    }
  }, [studentId, isCreateMode])

  // Get related data
  const student = students.find(s => s.id === studentId)
  const enrollment = enrollments.find(e => e.id === enrollmentId)
  const teacher = enrollment ? teachers.find(t => t.id === enrollment.teacherId) : null
  const instrument = enrollment ? instruments.find(i => i.id === enrollment.instrumentId) : null

  const getTransactionLabel = () => {
    if (isCreateMode) return 'Credit Purchase'
    switch (transaction?.type) {
      case 'purchase':
        return 'Credit Purchase'
      case 'adjustment':
        return 'Adjustment'
      case 'inventory_payment':
        return 'Inventory Payment'
      default:
        return 'Transaction'
    }
  }

  // Calculate values - compute hourlyRate inside to ensure fresh lookup
  const calculatedValues = useMemo(() => {
    // Find enrollment and teacher for rate calculation
    const currentEnrollment = enrollments.find(e => e.id === enrollmentId)
    const currentTeacher = currentEnrollment ? teachers.find(t => t.id === currentEnrollment.teacherId) : null
    const rate = (currentTeacher as any)?.hourlyRate || 0

    const taxRate = taxType === 'HST' ? 0.13 : taxType === 'GST' ? 0.05 : 0
    // For purchase transactions (create or edit), recalculate subtotal based on credits
    // For inventory payments in edit mode, use the original subtotal
    const subtotal = (isCreateMode || isPurchase) ? credits * rate : (transaction?.subtotal || 0)
    const totalBeforeTaxes = Math.max(0, subtotal - discountAmount)
    const taxAmount = totalBeforeTaxes * taxRate
    const total = totalBeforeTaxes + taxAmount
    return { subtotal, totalBeforeTaxes, taxAmount, total, taxRate, hourlyRate: rate }
  }, [transaction?.subtotal, credits, enrollmentId, enrollments, teachers, discountAmount, taxType, isCreateMode, isPurchase])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isCreateMode && (!studentId || !enrollmentId || credits <= 0 || !paymentMethod)) {
      return
    }

    const data: any = {}

    if (isCreateMode) {
      data.studentId = studentId
      data.enrollmentId = enrollmentId
    }

    if (isAdjustment || isPurchase) {
      data.credits = credits
    }
    data.note = note
    if (isPurchase || isInventoryPayment) {
      data.paymentMethod = paymentMethod
      data.discountAmount = discountAmount
      data.discountNote = discountNote || null
      data.taxType = taxType
    }

    onSubmit?.(data)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const transactionLabel = getTransactionLabel()
    const date = transaction
      ? new Date(transaction.date).toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

    doc.setFontSize(18)
    doc.text(transactionLabel, 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    if (transaction) {
      doc.text(`Transaction ID: ${transaction.id}`, 14, 30)
    }
    doc.text(`Date: ${date}`, 14, transaction ? 36 : 30)

    let yPos = transaction ? 48 : 42
    doc.setTextColor(0)
    doc.setFontSize(11)

    if (student) {
      doc.text(`Student: ${student.name}`, 14, yPos)
      yPos += 8
    }

    if (enrollment && instrument && teacher) {
      doc.text(`Enrollment: ${instrument.name} with ${teacher.name}`, 14, yPos)
      yPos += 8
    }

    if (isAdjustment || isPurchase) {
      doc.text(`Credits: ${credits}`, 14, yPos)
      yPos += 8
    }

    if (isPurchase || isInventoryPayment) {
      doc.text(`Amount: ${formatCurrency(calculatedValues.subtotal)}`, 14, yPos)
      yPos += 8
      doc.text(`Discount: ${formatCurrency(discountAmount)}`, 14, yPos)
      yPos += 8
      doc.text(`Total before taxes: ${formatCurrency(calculatedValues.totalBeforeTaxes)}`, 14, yPos)
      yPos += 8
      doc.text(`Tax Type: ${taxType === 'None' ? 'No Tax' : taxType}`, 14, yPos)
      yPos += 8
      doc.text(`Tax Amount: ${formatCurrency(calculatedValues.taxAmount)}`, 14, yPos)
      yPos += 8
      doc.text(`Total: ${formatCurrency(calculatedValues.total)}`, 14, yPos)
      yPos += 8
      doc.text(`Payment Method: ${paymentMethod || 'N/A'}`, 14, yPos)
      yPos += 8
    }

    if (note) {
      yPos += 4
      doc.text('Note:', 14, yPos)
      yPos += 6
      const splitNote = doc.splitTextToSize(note, 180)
      doc.text(splitNote, 14, yPos)
    }

    const filename = transaction
      ? `transaction-${transaction.id}.pdf`
      : `credit-purchase-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
  }

  const inputClasses = "w-48 h-[38px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
  const readOnlyClasses = "w-48 h-[38px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
  const selectClasses = "w-48 h-[38px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
  const rowClasses = "flex items-center justify-between"
  const labelClasses = "text-sm font-medium text-slate-700 dark:text-slate-300"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isEditMode && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Editing {getTransactionLabel()}
        </p>
      )}

      {/* Student */}
      <div className={rowClasses}>
        <label className={labelClasses}>Student</label>
        {isCreateMode ? (
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className={selectClasses}
            required
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={student?.name || 'Unknown Student'}
            readOnly
            className={readOnlyClasses}
          />
        )}
      </div>

      {/* Enrollment */}
      <div className={rowClasses}>
        <label className={labelClasses}>Enrollment</label>
        {isCreateMode ? (
          <select
            value={enrollmentId}
            onChange={(e) => setEnrollmentId(e.target.value)}
            disabled={!studentId}
            className={`${selectClasses} disabled:opacity-50`}
            required
          >
            <option value="">Select Enrollment</option>
            {studentEnrollments.map((e) => {
              const inst = instruments.find(i => i.id === e.instrumentId)
              const tch = teachers.find(t => t.id === e.teacherId)
              return (
                <option key={e.id} value={e.id}>
                  {inst?.name || 'Unknown'} with {tch?.name || 'Unknown'}
                </option>
              )
            })}
          </select>
        ) : (
          <input
            type="text"
            value={enrollment && instrument && teacher ? `${instrument.name} with ${teacher.name}` : 'N/A'}
            readOnly
            className={readOnlyClasses}
          />
        )}
      </div>

      {/* Credits */}
      {(isAdjustment || isPurchase) && (
        <div className={rowClasses}>
          <label className={labelClasses}>Credits</label>
          <input
            type="number"
            step="0.5"
            min={isCreateMode ? "0.5" : undefined}
            value={credits}
            onChange={(e) => setCredits(parseFloat(e.target.value) || 0)}
            className={inputClasses}
            required={isCreateMode}
          />
        </div>
      )}

      {/* Amount (Subtotal - read only) */}
      {(isPurchase || isInventoryPayment) && (
        <div className={rowClasses}>
          <label className={labelClasses}>Amount</label>
          <input
            type="text"
            value={formatCurrency(calculatedValues.subtotal)}
            readOnly
            className={readOnlyClasses}
          />
        </div>
      )}

      {/* Discount Amount */}
      {(isPurchase || isInventoryPayment) && (
        <div className={rowClasses}>
          <label className={labelClasses}>Discount Amount</label>
          <div className="relative w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
              className="w-full h-[38px] rounded-lg border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      )}

      {/* Total before taxes (read only) */}
      {(isPurchase || isInventoryPayment) && (
        <div className={rowClasses}>
          <label className={labelClasses}>Total before taxes</label>
          <input
            type="text"
            value={formatCurrency(calculatedValues.totalBeforeTaxes)}
            readOnly
            className={readOnlyClasses}
          />
        </div>
      )}

      {/* Tax Type */}
      {(isPurchase || isInventoryPayment) && (
        <div className={rowClasses}>
          <label className={labelClasses}>Tax Type</label>
          <select
            value={taxType}
            onChange={(e) => setTaxType(e.target.value as TaxType)}
            className={selectClasses}
          >
            <option value="HST">HST (13%)</option>
            <option value="GST">GST (5%)</option>
            <option value="None">No Tax</option>
          </select>
        </div>
      )}

      {/* Tax Amount (read only) */}
      {(isPurchase || isInventoryPayment) && (
        <div className={rowClasses}>
          <label className={labelClasses}>Tax Amount</label>
          <input
            type="text"
            value={formatCurrency(calculatedValues.taxAmount)}
            readOnly
            className={readOnlyClasses}
          />
        </div>
      )}

      {/* Total */}
      {(isPurchase || isInventoryPayment) && (
        <div className={rowClasses}>
          <label className={labelClasses}>Total</label>
          <input
            type="text"
            value={formatCurrency(calculatedValues.total)}
            readOnly
            className={readOnlyClasses}
          />
        </div>
      )}

      {/* Payment Method */}
      {(isPurchase || isInventoryPayment) && (
        <div className={rowClasses}>
          <label className={labelClasses}>Payment Method</label>
          <select
            value={paymentMethod || ''}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className={selectClasses}
            required={isCreateMode}
          >
            <option value="">Select payment method</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit">Debit</option>
            <option value="Cash">Cash</option>
            <option value="E-Transfer">E-Transfer</option>
          </select>
        </div>
      )}

      {/* Note (at the bottom) */}
      <div className="pt-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Note
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={exportToPDF}
          disabled={isCreateMode && (!studentId || !enrollmentId || credits <= 0)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <FileText className="h-4 w-4" />
          Export to PDF
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            {isCreateMode ? 'Process Payment' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}
