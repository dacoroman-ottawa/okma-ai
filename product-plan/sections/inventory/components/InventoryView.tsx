import { useState } from 'react'
import {
  Package,
  Clock,
  ShoppingBag,
  Truck,
  Users,
} from 'lucide-react'
import type { InventoryProps } from '../types'
import { ProductsTab } from './ProductsTab'
import { RentalsTab } from './RentalsTab'
import { SalesTab } from './SalesTab'
import { SuppliersTab } from './SuppliersTab'
import { CustomersTab } from './CustomersTab'

type TabType = 'products' | 'rentals' | 'sales' | 'suppliers' | 'customers'

const tabs: { id: TabType; label: string; icon: typeof Package }[] = [
  { id: 'products', label: 'Products', icon: Package },
  { id: 'rentals', label: 'Rentals', icon: Clock },
  { id: 'sales', label: 'Sales', icon: ShoppingBag },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'customers', label: 'Customers', icon: Users },
]

export function InventoryView({
  products,
  suppliers,
  customers,
  rentals,
  sales,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  onAddProduct,
  onViewSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onAddSupplier,
  onViewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onAddCustomer,
  onViewRental,
  onReturnRental,
  onCreateRental,
  onViewSale,
  onRecordSale,
}: InventoryProps) {
  const [activeTab, setActiveTab] = useState<TabType>('products')

  // Calculate badge counts
  const activeRentalsCount = rentals.filter(
    (r) => r.status === 'active' || r.status === 'overdue'
  ).length
  const overdueCount = rentals.filter((r) => r.status === 'overdue').length
  const lowStockCount = products.filter(
    (p) => p.active && p.stockQuantity <= p.reorderLevel
  ).length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {products.filter((p) => p.active).length} products, {activeRentalsCount} active rentals
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              // Show badge for rentals if there are overdue items
              let badge = null
              if (tab.id === 'rentals' && overdueCount > 0) {
                badge = (
                  <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-medium text-white">
                    {overdueCount}
                  </span>
                )
              }
              // Show badge for products if there are low stock items
              if (tab.id === 'products' && lowStockCount > 0) {
                badge = (
                  <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-xs font-medium text-white">
                    {lowStockCount}
                  </span>
                )
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {badge}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            suppliers={suppliers}
            onViewProduct={onViewProduct}
            onEditProduct={onEditProduct}
            onAddProduct={onAddProduct}
          />
        )}

        {activeTab === 'rentals' && (
          <RentalsTab
            rentals={rentals}
            products={products}
            customers={customers}
            onViewRental={onViewRental}
            onReturnRental={onReturnRental}
            onCreateRental={onCreateRental}
          />
        )}

        {activeTab === 'sales' && (
          <SalesTab
            sales={sales}
            products={products}
            customers={customers}
            onViewSale={onViewSale}
            onRecordSale={onRecordSale}
          />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersTab
            suppliers={suppliers}
            products={products}
            onViewSupplier={onViewSupplier}
            onEditSupplier={onEditSupplier}
            onAddSupplier={onAddSupplier}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersTab
            customers={customers}
            rentals={rentals}
            onViewCustomer={onViewCustomer}
            onEditCustomer={onEditCustomer}
            onAddCustomer={onAddCustomer}
          />
        )}
      </div>
    </div>
  )
}
