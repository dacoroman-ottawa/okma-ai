// =============================================================================
// Data Types
// =============================================================================

export type TransactionType =
  | 'credit_purchase'
  | 'credit_deduction'
  | 'credit_adjustment'
  | 'inventory_payment'

export type TaxType = 'HST' | 'GST' | 'None'

export type PaymentMethod = 'Credit Card' | 'Debit' | 'Cash' | 'E-Transfer' | null

export interface LineItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface Transaction {
  id: string
  type: TransactionType
  studentId: string
  enrollmentId: string | null
  date: string
  credits: number
  pricePerCredit: number
  subtotal: number
  discountAmount: number
  discountNote: string | null
  taxType: TaxType
  taxRate: number
  taxAmount: number
  totalAmount: number
  paymentMethod: PaymentMethod
  note: string | null
  lineItems?: LineItem[]
}

export interface StudentBalance {
  studentId: string
  enrollmentId: string
  teacherId: string
  instrumentId: string
  currentBalance: number
  totalPurchased: number
  totalUsed: number
}

// =============================================================================
// Component Props
// =============================================================================

export interface TransactionListProps {
  /** List of transactions to display */
  transactions: Transaction[]
  /** Students for resolving names */
  students: Array<{ id: string; name: string }>
  /** Teachers for resolving names */
  teachers: Array<{ id: string; name: string }>
  /** Instruments for resolving names */
  instruments: Array<{ id: string; name: string }>
  /** Enrollments for resolving enrollment details */
  enrollments: Array<{ id: string; studentId: string; teacherId: string; instrumentId: string }>
  /** Called when user wants to view transaction details */
  onViewTransaction?: (id: string) => void
  /** Called when user wants to add a new credit purchase */
  onAddCreditPurchase?: () => void
  /** Called when user wants to add a credit adjustment */
  onAddAdjustment?: () => void
  /** Called when user wants to add an inventory payment */
  onAddInventoryPayment?: () => void
}

export interface StudentBalancesProps {
  /** Student credit balances */
  balances: StudentBalance[]
  /** Students for resolving names */
  students: Array<{ id: string; name: string }>
  /** Teachers for resolving names */
  teachers: Array<{ id: string; name: string }>
  /** Instruments for resolving names */
  instruments: Array<{ id: string; name: string }>
  /** Called when user wants to view a student's transaction history */
  onViewStudentHistory?: (studentId: string) => void
  /** Called when user wants to add credits for a student */
  onAddCredits?: (studentId: string, enrollmentId: string) => void
}

export interface CreditPurchaseFormProps {
  /** Available students */
  students: Array<{ id: string; name: string }>
  /** Enrollments to choose from */
  enrollments: Array<{ id: string; studentId: string; teacherId: string; instrumentId: string }>
  /** Teachers for pricing */
  teachers: Array<{ id: string; name: string; hourlyRate: number }>
  /** Instruments for display */
  instruments: Array<{ id: string; name: string }>
  /** Called when form is submitted */
  onSubmit?: (data: {
    studentId: string
    enrollmentId: string
    credits: number
    discountAmount: number
    discountNote: string | null
    taxType: TaxType
    paymentMethod: PaymentMethod
  }) => void
  /** Called when form is cancelled */
  onCancel?: () => void
}

export interface CreditAdjustmentFormProps {
  /** Available students */
  students: Array<{ id: string; name: string }>
  /** Enrollments to choose from */
  enrollments: Array<{ id: string; studentId: string; teacherId: string; instrumentId: string }>
  /** Called when form is submitted */
  onSubmit?: (data: {
    studentId: string
    enrollmentId: string
    credits: number
    note: string
  }) => void
  /** Called when form is cancelled */
  onCancel?: () => void
}

export interface InventoryPaymentFormProps {
  /** Available customers (students) */
  customers: Array<{ id: string; name: string }>
  /** Called when form is submitted */
  onSubmit?: (data: {
    customerId: string
    lineItems: LineItem[]
    discountAmount: number
    discountNote: string | null
    taxType: TaxType
    paymentMethod: PaymentMethod
  }) => void
  /** Called when form is cancelled */
  onCancel?: () => void
}

export interface PaymentsProps {
  /** All transactions */
  transactions: Transaction[]
  /** Student credit balances */
  balances: StudentBalance[]
  /** Students for resolving names */
  students: Array<{ id: string; name: string }>
  /** Teachers for resolving names and pricing */
  teachers: Array<{ id: string; name: string; hourlyRate: number }>
  /** Instruments for resolving names */
  instruments: Array<{ id: string; name: string }>
  /** Enrollments for resolving details */
  enrollments: Array<{ id: string; studentId: string; teacherId: string; instrumentId: string }>
  /** Called when user wants to view transaction details */
  onViewTransaction?: (id: string) => void
  /** Called when user wants to view a student's transaction history */
  onViewStudentHistory?: (studentId: string) => void
  /** Called when user wants to add a new credit purchase */
  onAddCreditPurchase?: () => void
  /** Called when user wants to add a credit adjustment */
  onAddAdjustment?: () => void
  /** Called when user wants to add an inventory payment */
  onAddInventoryPayment?: () => void
  /** Called when user wants to add credits for a specific student */
  onAddCreditsForStudent?: (studentId: string, enrollmentId: string) => void
}
