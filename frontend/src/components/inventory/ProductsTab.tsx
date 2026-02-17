import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  AlertTriangle,
  Package,
  Music,
  BookOpen,
  FileText,
  Gift,
  Wrench,
  ChevronRight,
  Filter,
} from 'lucide-react'
import type { Product, Supplier, ProductType } from '../types'

interface ProductsTabProps {
  products: Product[]
  suppliers: Supplier[]
  onViewProduct?: (id: string) => void
  onEditProduct?: (id: string) => void
  onAddProduct?: () => void
}

const typeIcons: Record<ProductType, typeof Package> = {
  instrument: Music,
  book: BookOpen,
  accessory: Wrench,
  musical_score: FileText,
  gift_card: Gift,
}

const typeLabels: Record<ProductType, string> = {
  instrument: 'Instrument',
  book: 'Book',
  accessory: 'Accessory',
  musical_score: 'Score',
  gift_card: 'Gift Card',
}

type StockFilter = 'all' | 'low' | 'out'

export function ProductsTab({
  products,
  suppliers,
  onViewProduct,
  onEditProduct,
  onAddProduct,
}: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all')
  const [supplierFilter, setSupplierFilter] = useState<string | 'all'>('all')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')

  const getSupplierName = (id: string | null) =>
    id ? suppliers.find((s) => s.id === id)?.name ?? 'Unknown' : '—'

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) return 'out'
    if (product.stockQuantity <= product.reorderLevel) return 'low'
    return 'ok'
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.active) return false
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.model?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }
      if (typeFilter !== 'all' && product.type !== typeFilter) return false
      if (supplierFilter !== 'all' && product.supplierId !== supplierFilter)
        return false
      if (stockFilter === 'low' && getStockStatus(product) !== 'low')
        return false
      if (stockFilter === 'out' && getStockStatus(product) !== 'out')
        return false
      return true
    })
  }, [products, searchQuery, typeFilter, supplierFilter, stockFilter])

  const lowStockCount = products.filter(
    (p) => p.active && p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0
  ).length
  const outOfStockCount = products.filter(
    (p) => p.active && p.stockQuantity === 0
  ).length

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {lowStockCount > 0 && (
            <button
              onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                stockFilter === 'low'
                  ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              {lowStockCount} Low Stock
            </button>
          )}
          {outOfStockCount > 0 && (
            <button
              onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                stockFilter === 'out'
                  ? 'border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
              }`}
            >
              <Package className="h-4 w-4" />
              {outOfStockCount} Out of Stock
            </button>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ProductType | 'all')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="all">All Types</option>
              <option value="instrument">Instruments</option>
              <option value="book">Books</option>
              <option value="accessory">Accessories</option>
              <option value="musical_score">Scores</option>
              <option value="gift_card">Gift Cards</option>
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="all">All Suppliers</option>
              {suppliers
                .filter((s) => s.active)
                .map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <button
          onClick={onAddProduct}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Results count */}
      {(searchQuery || typeFilter !== 'all' || supplierFilter !== 'all' || stockFilter !== 'all') && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredProducts.length} of {products.filter((p) => p.active).length} products
          {stockFilter !== 'all' && (
            <button
              onClick={() => setStockFilter('all')}
              className="ml-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Clear filter
            </button>
          )}
        </p>
      )}

      {/* Products table */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
            No products found
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {searchQuery || typeFilter !== 'all' || supplierFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first product to get started'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          {/* Desktop table */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Stock
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredProducts.map((product) => {
                  const Icon = typeIcons[product.type]
                  const stockStatus = getStockStatus(product)

                  return (
                    <tr
                      key={product.id}
                      onClick={() => onViewProduct?.(product.id)}
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                            <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {product.name}
                            </p>
                            {product.model && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {product.model}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {typeLabels[product.type]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {getSupplierName(product.supplierId)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(product.sellingPrice)}
                        </p>
                        {product.rentalPrice && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatCurrency(product.rentalPrice)}/mo rental
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {stockStatus === 'out' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              <AlertTriangle className="h-3 w-3" />
                              Out
                            </span>
                          )}
                          {stockStatus === 'low' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              <AlertTriangle className="h-3 w-3" />
                              Low
                            </span>
                          )}
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {product.stockQuantity}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="divide-y divide-slate-200 lg:hidden dark:divide-slate-700">
            {filteredProducts.map((product) => {
              const Icon = typeIcons[product.type]
              const stockStatus = getStockStatus(product)

              return (
                <div
                  key={product.id}
                  onClick={() => onViewProduct?.(product.id)}
                  className="cursor-pointer p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {product.name}
                        </p>
                        {product.model && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {product.model}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {typeLabels[product.type]} &middot;{' '}
                          {getSupplierName(product.supplierId)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(product.sellingPrice)}
                      </p>
                      <div className="mt-1 flex items-center justify-end gap-1">
                        {stockStatus !== 'ok' && (
                          <AlertTriangle
                            className={`h-3.5 w-3.5 ${
                              stockStatus === 'out'
                                ? 'text-red-500'
                                : 'text-amber-500'
                            }`}
                          />
                        )}
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {product.stockQuantity} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
