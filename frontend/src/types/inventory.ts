// =============================================================================
// Data Types
// =============================================================================

export type ProductType = 'instrument' | 'book' | 'accessory' | 'musical_score' | 'gift_card'

export type RentalPeriod = 'weekly' | 'monthly'

export type RentalStatus = 'active' | 'overdue' | 'returned'

export type PaymentMethod = 'Credit Card' | 'Debit' | 'Cash' | 'E-Transfer'

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  active: boolean
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  notes: string | null
}

export interface Product {
  id: string
  type: ProductType
  name: string
  model: string | null
  serialNumber: string | null
  supplierId: string | null
  cost: number
  sellingPrice: number
  rentalPrice: number | null
  stockQuantity: number
  reorderLevel: number
  active: boolean
}

export interface Rental {
  id: string
  productId: string
  customerId: string
  rentalPeriod: RentalPeriod
  startDate: string
  dueDate: string
  returnDate: string | null
  deposit: number
  rentalFee: number
  lateFee: number
  status: RentalStatus
  conditionNotes: string | null
}

export interface Sale {
  id: string
  productId: string
  customerId: string
  date: string
  quantity: number
  unitPrice: number
  totalAmount: number
  paymentMethod: PaymentMethod
}

// =============================================================================
// Component Props
// =============================================================================

export interface ProductListProps {
  /** List of products to display */
  products: Product[]
  /** Suppliers for resolving names */
  suppliers: Supplier[]
  /** Called when user wants to view product details */
  onViewProduct?: (id: string) => void
  /** Called when user wants to edit a product */
  onEditProduct?: (id: string) => void
  /** Called when user wants to delete a product */
  onDeleteProduct?: (id: string) => void
  /** Called when user wants to add a new product */
  onAddProduct?: () => void
}

export interface SupplierListProps {
  /** List of suppliers to display */
  suppliers: Supplier[]
  /** Products for counting per supplier */
  products: Product[]
  /** Called when user wants to view supplier details */
  onViewSupplier?: (id: string) => void
  /** Called when user wants to edit a supplier */
  onEditSupplier?: (id: string) => void
  /** Called when user wants to delete a supplier */
  onDeleteSupplier?: (id: string) => void
  /** Called when user wants to add a new supplier */
  onAddSupplier?: () => void
}

export interface CustomerListProps {
  /** List of customers to display */
  customers: Customer[]
  /** Rentals for counting active per customer */
  rentals: Rental[]
  /** Called when user wants to view customer details */
  onViewCustomer?: (id: string) => void
  /** Called when user wants to edit a customer */
  onEditCustomer?: (id: string) => void
  /** Called when user wants to delete a customer */
  onDeleteCustomer?: (id: string) => void
  /** Called when user wants to add a new customer */
  onAddCustomer?: () => void
}

export interface RentalListProps {
  /** List of rentals to display */
  rentals: Rental[]
  /** Products for resolving names */
  products: Product[]
  /** Customers for resolving names */
  customers: Customer[]
  /** Called when user wants to view rental details */
  onViewRental?: (id: string) => void
  /** Called when user wants to mark a rental as returned */
  onReturnRental?: (id: string) => void
  /** Called when user wants to create a new rental */
  onCreateRental?: () => void
}

export interface SalesListProps {
  /** List of sales to display */
  sales: Sale[]
  /** Products for resolving names */
  products: Product[]
  /** Customers for resolving names */
  customers: Customer[]
  /** Called when user wants to view sale details */
  onViewSale?: (id: string) => void
  /** Called when user wants to record a new sale */
  onRecordSale?: () => void
}

export interface InventoryProps {
  /** All products in the catalog */
  products: Product[]
  /** All suppliers */
  suppliers: Supplier[]
  /** All customers */
  customers: Customer[]
  /** All rentals */
  rentals: Rental[]
  /** All sales */
  sales: Sale[]
  /** Called when user wants to view product details */
  onViewProduct?: (id: string) => void
  /** Called when user wants to edit a product */
  onEditProduct?: (id: string) => void
  /** Called when user wants to delete a product */
  onDeleteProduct?: (id: string) => void
  /** Called when user wants to add a new product */
  onAddProduct?: () => void
  /** Called when user wants to view supplier details */
  onViewSupplier?: (id: string) => void
  /** Called when user wants to edit a supplier */
  onEditSupplier?: (id: string) => void
  /** Called when user wants to delete a supplier */
  onDeleteSupplier?: (id: string) => void
  /** Called when user wants to add a new supplier */
  onAddSupplier?: () => void
  /** Called when user wants to view customer details */
  onViewCustomer?: (id: string) => void
  /** Called when user wants to edit a customer */
  onEditCustomer?: (id: string) => void
  /** Called when user wants to delete a customer */
  onDeleteCustomer?: (id: string) => void
  /** Called when user wants to add a new customer */
  onAddCustomer?: () => void
  /** Called when user wants to view rental details */
  onViewRental?: (id: string) => void
  /** Called when user wants to mark a rental as returned */
  onReturnRental?: (id: string) => void
  /** Called when user wants to create a new rental */
  onCreateRental?: () => void
  /** Called when user wants to view sale details */
  onViewSale?: (id: string) => void
  /** Called when user wants to record a new sale */
  onRecordSale?: () => void
}
