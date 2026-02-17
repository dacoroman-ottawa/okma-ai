"use client"

import { useInventory } from "@/hooks/useInventory"
import { InventoryView } from "@/components/inventory/InventoryView"

export default function InventoryPage() {
    const {
        products,
        suppliers,
        customers,
        rentals,
        sales,
        loading,
        error,
        deleteProduct,
        deleteSupplier,
        deleteCustomer,
        returnRental,
    } = useInventory()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <InventoryView
            products={products}
            suppliers={suppliers}
            customers={customers}
            rentals={rentals}
            sales={sales}
            onViewProduct={(id: string) => console.log("View product:", id)}
            onEditProduct={(id: string) => console.log("Edit product:", id)}
            onDeleteProduct={(id: string) => deleteProduct(id)}
            onAddProduct={() => console.log("Add product")}
            onViewSupplier={(id: string) => console.log("View supplier:", id)}
            onEditSupplier={(id: string) => console.log("Edit supplier:", id)}
            onDeleteSupplier={(id: string) => deleteSupplier(id)}
            onAddSupplier={() => console.log("Add supplier")}
            onViewCustomer={(id: string) => console.log("View customer:", id)}
            onEditCustomer={(id: string) => console.log("Edit customer:", id)}
            onDeleteCustomer={(id: string) => deleteCustomer(id)}
            onAddCustomer={() => console.log("Add customer")}
            onViewRental={(id: string) => console.log("View rental:", id)}
            onReturnRental={(id: string) => returnRental(id)}
            onCreateRental={() => console.log("Create rental")}
            onViewSale={(id: string) => console.log("View sale:", id)}
            onRecordSale={() => console.log("Record sale")}
        />
    )
}
