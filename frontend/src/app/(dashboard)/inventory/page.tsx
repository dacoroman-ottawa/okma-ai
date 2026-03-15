"use client"

import { useState } from "react"
import { useInventory } from "@/hooks/useInventory"
import { InventoryView } from "@/components/inventory/InventoryView"
import { CustomerFormModal } from "@/components/inventory/CustomerFormModal"
import type { Customer, InventoryTabType } from "@/types/inventory"

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
        createCustomer,
        updateCustomer,
        returnRental,
    } = useInventory()

    const [activeTab, setActiveTab] = useState<InventoryTabType>("products")
    const [customerModalOpen, setCustomerModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

    const handleAddCustomer = () => {
        setEditingCustomer(null)
        setCustomerModalOpen(true)
    }

    const handleEditCustomer = (id: string) => {
        const customer = customers.find((c) => c.id === id)
        if (customer) {
            setEditingCustomer(customer)
            setCustomerModalOpen(true)
        }
    }

    const handleSaveCustomer = async (data: Partial<Customer>) => {
        if (editingCustomer) {
            return await updateCustomer(editingCustomer.id, data)
        } else {
            return await createCustomer(data)
        }
    }

    const handleToggleCustomerStatus = async (id: string) => {
        const customer = customers.find((c) => c.id === id)
        if (customer) {
            await updateCustomer(id, { active: !customer.active })
        }
    }

    // Only show loading spinner on initial load, not on refreshes
    const isInitialLoad = loading && products.length === 0

    if (isInitialLoad) {
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
        <>
            <InventoryView
                products={products}
                suppliers={suppliers}
                customers={customers}
                rentals={rentals}
                sales={sales}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onViewProduct={(id: string) => console.log("View product:", id)}
                onEditProduct={(id: string) => console.log("Edit product:", id)}
                onDeleteProduct={(id: string) => deleteProduct(id)}
                onAddProduct={() => console.log("Add product")}
                onViewSupplier={(id: string) => console.log("View supplier:", id)}
                onEditSupplier={(id: string) => console.log("Edit supplier:", id)}
                onDeleteSupplier={(id: string) => deleteSupplier(id)}
                onAddSupplier={() => console.log("Add supplier")}
                onViewCustomer={(id: string) => console.log("View customer:", id)}
                onEditCustomer={handleEditCustomer}
                onDeleteCustomer={(id: string) => deleteCustomer(id)}
                onToggleCustomerStatus={handleToggleCustomerStatus}
                onAddCustomer={handleAddCustomer}
                onViewRental={(id: string) => console.log("View rental:", id)}
                onReturnRental={(id: string) => returnRental(id)}
                onCreateRental={() => console.log("Create rental")}
                onViewSale={(id: string) => console.log("View sale:", id)}
                onRecordSale={() => console.log("Record sale")}
            />

            <CustomerFormModal
                customer={editingCustomer}
                isOpen={customerModalOpen}
                onClose={() => setCustomerModalOpen(false)}
                onSave={handleSaveCustomer}
            />
        </>
    )
}
