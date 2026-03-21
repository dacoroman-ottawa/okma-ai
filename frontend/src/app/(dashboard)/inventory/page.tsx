"use client"

import { useState } from "react"
import { useInventory } from "@/hooks/useInventory"
import { InventoryView } from "@/components/inventory/InventoryView"
import { CustomerFormModal } from "@/components/inventory/CustomerFormModal"
import { SupplierFormModal } from "@/components/inventory/SupplierFormModal"
import { ProductFormModal } from "@/components/inventory/ProductFormModal"
import { RentalFormModal } from "@/components/inventory/RentalFormModal"
import { SaleFormModal } from "@/components/inventory/SaleFormModal"
import type { Customer, Supplier, Product, Rental, Sale, InventoryTabType } from "@/types/inventory"

export default function InventoryPage() {
    const {
        products,
        suppliers,
        customers,
        rentals,
        sales,
        loading,
        error,
        createProduct,
        updateProduct,
        deleteProduct,
        createSupplier,
        deleteSupplier,
        updateSupplier,
        deleteCustomer,
        createCustomer,
        updateCustomer,
        createRental,
        returnRental,
        updateRental,
        deleteRental,
        createSale,
        updateSale,
        deleteSale,
    } = useInventory()

    const [activeTab, setActiveTab] = useState<InventoryTabType>("products")
    const [customerModalOpen, setCustomerModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [supplierModalOpen, setSupplierModalOpen] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
    const [togglingSupplier, setTogglingSupplier] = useState<string | null>(null)
    const [productModalOpen, setProductModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [togglingProduct, setTogglingProduct] = useState<string | null>(null)
    const [rentalModalOpen, setRentalModalOpen] = useState(false)
    const [editingRental, setEditingRental] = useState<Rental | null>(null)
    const [saleModalOpen, setSaleModalOpen] = useState(false)
    const [editingSale, setEditingSale] = useState<Sale | null>(null)

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

    const handleAddSupplier = () => {
        setEditingSupplier(null)
        setSupplierModalOpen(true)
    }

    const handleEditSupplier = (id: string) => {
        const supplier = suppliers.find((s) => s.id === id)
        if (supplier) {
            setEditingSupplier(supplier)
            setSupplierModalOpen(true)
        }
    }

    const handleSaveSupplier = async (data: Partial<Supplier>) => {
        if (editingSupplier) {
            return await updateSupplier(editingSupplier.id, data)
        } else {
            return await createSupplier(data)
        }
    }

    const handleToggleSupplierStatus = async (id: string) => {
        // Prevent multiple simultaneous toggles
        if (togglingSupplier) return

        const supplier = suppliers.find((s) => s.id === id)
        if (supplier) {
            setTogglingSupplier(id)
            try {
                await updateSupplier(id, { active: !supplier.active })
            } finally {
                setTogglingSupplier(null)
            }
        }
    }

    const handleAddProduct = () => {
        setEditingProduct(null)
        setProductModalOpen(true)
    }

    const handleEditProduct = (id: string) => {
        const product = products.find((p) => p.id === id)
        if (product) {
            setEditingProduct(product)
            setProductModalOpen(true)
        }
    }

    const handleSaveProduct = async (data: Partial<Product>) => {
        if (editingProduct) {
            return await updateProduct(editingProduct.id, data)
        } else {
            return await createProduct(data)
        }
    }

    const handleToggleProductStatus = async (id: string) => {
        // Prevent multiple simultaneous toggles
        if (togglingProduct) return

        const product = products.find((p) => p.id === id)
        if (product) {
            setTogglingProduct(id)
            try {
                await updateProduct(id, { active: !product.active })
            } finally {
                setTogglingProduct(null)
            }
        }
    }

    const handleCreateRental = () => {
        setEditingRental(null)
        setRentalModalOpen(true)
    }

    const handleEditRental = (id: string) => {
        const rental = rentals.find((r) => r.id === id)
        if (rental) {
            setEditingRental(rental)
            setRentalModalOpen(true)
        }
    }

    const handleSaveRental = async (data: Partial<Rental>) => {
        if (editingRental) {
            return await updateRental(editingRental.id, data)
        } else {
            return await createRental(data)
        }
    }

    const handleNewSale = () => {
        setEditingSale(null)
        setSaleModalOpen(true)
    }

    const handleEditSale = (id: string) => {
        const sale = sales.find((s) => s.id === id)
        if (sale) {
            setEditingSale(sale)
            setSaleModalOpen(true)
        }
    }

    const handleSaveSale = async (data: Partial<Sale>) => {
        if (editingSale) {
            return await updateSale(editingSale.id, data)
        } else {
            return await createSale(data)
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
                onEditProduct={handleEditProduct}
                onDeleteProduct={(id: string) => deleteProduct(id)}
                onToggleProductStatus={handleToggleProductStatus}
                onAddProduct={handleAddProduct}
                onViewSupplier={(id: string) => console.log("View supplier:", id)}
                onEditSupplier={handleEditSupplier}
                onDeleteSupplier={(id: string) => deleteSupplier(id)}
                onToggleSupplierStatus={handleToggleSupplierStatus}
                onAddSupplier={handleAddSupplier}
                onViewCustomer={(id: string) => console.log("View customer:", id)}
                onEditCustomer={handleEditCustomer}
                onDeleteCustomer={(id: string) => deleteCustomer(id)}
                onToggleCustomerStatus={handleToggleCustomerStatus}
                onAddCustomer={handleAddCustomer}
                onViewRental={(id: string) => console.log("View rental:", id)}
                onEditRental={handleEditRental}
                onDeleteRental={(id: string) => deleteRental(id)}
                onReturnRental={(id: string) => returnRental(id)}
                onCreateRental={handleCreateRental}
                onViewSale={(id: string) => console.log("View sale:", id)}
                onEditSale={handleEditSale}
                onDeleteSale={(id: string) => deleteSale(id)}
                onRecordSale={handleNewSale}
            />

            <CustomerFormModal
                customer={editingCustomer}
                isOpen={customerModalOpen}
                onClose={() => setCustomerModalOpen(false)}
                onSave={handleSaveCustomer}
            />

            <SupplierFormModal
                supplier={editingSupplier}
                isOpen={supplierModalOpen}
                onClose={() => setSupplierModalOpen(false)}
                onSave={handleSaveSupplier}
            />

            <ProductFormModal
                product={editingProduct}
                suppliers={suppliers}
                isOpen={productModalOpen}
                onClose={() => setProductModalOpen(false)}
                onSave={handleSaveProduct}
            />

            <RentalFormModal
                rental={editingRental}
                products={products}
                customers={customers}
                isOpen={rentalModalOpen}
                onClose={() => setRentalModalOpen(false)}
                onSave={handleSaveRental}
            />

            <SaleFormModal
                sale={editingSale}
                products={products}
                customers={customers}
                isOpen={saleModalOpen}
                onClose={() => setSaleModalOpen(false)}
                onSave={handleSaveSale}
            />
        </>
    )
}
