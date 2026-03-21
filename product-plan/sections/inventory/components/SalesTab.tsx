import { useMemo } from 'react'
import { Plus, ShoppingBag, ChevronRight } from 'lucide-react'
import type { Sale, Product, Customer } from '../types'

interface SalesTabProps {
  sales: Sale[]
  products: Product[]
  customers: Customer[]
  onViewSale?: (id: string) => void
  onRecordSale?: () => void
}

export function SalesTab({
  sales,
  products,
  customers,
  onViewSale,
  onRecordSale,
}: SalesTabProps) {
  const getProductName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? 'Unknown Product'

  const getCustomerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? 'Unknown Customer'

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)

  const sortedSales = useMemo(() => {
    return [...sales].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [sales])

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Sales
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {sales.length}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Revenue
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>

        <button
          onClick={onRecordSale}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Record Sale
        </button>
      </div>

      {/* Sales table */}
      {sortedSales.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
            No sales yet
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sales will appear here when products are sold.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedSales.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => onViewSale?.(sale.id)}
                    className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(sale.date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {getProductName(sale.productId)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {getCustomerName(sale.customerId)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-slate-600 dark:text-slate-400">
                      {sale.quantity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="divide-y divide-slate-200 md:hidden dark:divide-slate-700">
            {sortedSales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => onViewSale?.(sale.id)}
                className="cursor-pointer p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {getProductName(sale.productId)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {getCustomerName(sale.customerId)}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <span>{formatDate(sale.date)}</span>
                      <span>&middot;</span>
                      <span>{sale.paymentMethod}</span>
                      {sale.quantity > 1 && (
                        <>
                          <span>&middot;</span>
                          <span>Qty: {sale.quantity}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(sale.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
