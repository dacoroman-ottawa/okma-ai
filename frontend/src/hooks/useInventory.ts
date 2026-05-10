"use client"

import { useState, useEffect, useCallback } from "react"
import type {
    Product,
    Supplier,
    Customer,
    Rental,
    Sale,
} from "../types/inventory"
import { toCamel, toSnake, getAuthHeaders, API_BASE_URL } from "@/lib/utils"

export function useInventory() {
    const [products, setProducts] = useState<Product[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [rentals, setRentals] = useState<Rental[]>([])
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const headers = getAuthHeaders()

            const [prodRes, suppRes, custRes, rentRes, salesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/inventory/products`, { headers }),
                fetch(`${API_BASE_URL}/inventory/suppliers`, { headers }),
                fetch(`${API_BASE_URL}/inventory/customers`, { headers }),
                fetch(`${API_BASE_URL}/inventory/rentals`, { headers }),
                fetch(`${API_BASE_URL}/inventory/sales`, { headers }),
            ])

            if (!prodRes.ok || !suppRes.ok || !custRes.ok || !rentRes.ok || !salesRes.ok) {
                throw new Error("Failed to fetch inventory data")
            }

            const [prodData, suppData, custData, rentData, salesData] = await Promise.all([
                prodRes.json(),
                suppRes.json(),
                custRes.json(),
                rentRes.json(),
                salesRes.json(),
            ])

            setProducts(toCamel(prodData))
            setSuppliers(toCamel(suppData))
            setCustomers(toCamel(custData))
            setRentals(toCamel(rentData))
            setSales(toCamel(salesData))
            setError(null)
        } catch (err) {
            console.error("Fetch inventory error:", err)
            setError("Failed to load inventory data")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Product operations
    const createProduct = async (data: Partial<Product>) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/products`, {
                method: "POST",
                headers,
                body: JSON.stringify(toSnake(data)),
            })
            if (!res.ok) throw new Error("Failed to create product")
            await fetchData()
            return true
        } catch (err) {
            console.error("Create product error:", err)
            setError("Failed to create product")
            return false
        }
    }

    const updateProduct = async (id: string, data: Partial<Product>) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/products/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(toSnake(data)),
            })
            if (!res.ok) throw new Error("Failed to update product")
            await fetchData()
            return true
        } catch (err) {
            console.error("Update product error:", err)
            setError("Failed to update product")
            return false
        }
    }

    const deleteProduct = async (id: string) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/products/${id}`, {
                method: "DELETE",
                headers,
            })
            if (!res.ok) throw new Error("Failed to delete product")
            await fetchData()
            return true
        } catch (err) {
            console.error("Delete product error:", err)
            setError("Failed to delete product")
            return false
        }
    }

    // Supplier operations
    const createSupplier = async (data: Partial<Supplier>) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/suppliers`, {
                method: "POST",
                headers,
                body: JSON.stringify(toSnake(data)),
            })
            if (!res.ok) throw new Error("Failed to create supplier")
            await fetchData()
            return true
        } catch (err) {
            console.error("Create supplier error:", err)
            setError("Failed to create supplier")
            return false
        }
    }

    const updateSupplier = async (id: string, data: Partial<Supplier>) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/suppliers/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(toSnake(data)),
            })
            if (!res.ok) throw new Error("Failed to update supplier")
            await fetchData()
            return true
        } catch (err) {
            console.error("Update supplier error:", err)
            setError("Failed to update supplier")
            return false
        }
    }

    const deleteSupplier = async (id: string) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/suppliers/${id}`, {
                method: "DELETE",
                headers,
            })
            if (!res.ok) throw new Error("Failed to delete supplier")
            await fetchData()
            return true
        } catch (err) {
            console.error("Delete supplier error:", err)
            setError("Failed to delete supplier")
            return false
        }
    }

    // Customer operations
    const createCustomer = async (data: Partial<Customer>) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/customers`, {
                method: "POST",
                headers,
                body: JSON.stringify(toSnake(data)),
            })
            if (!res.ok) throw new Error("Failed to create customer")
            await fetchData()
            return true
        } catch (err) {
            console.error("Create customer error:", err)
            setError("Failed to create customer")
            return false
        }
    }

    const updateCustomer = async (id: string, data: Partial<Customer>) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/customers/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(toSnake(data)),
            })
            if (!res.ok) throw new Error("Failed to update customer")
            await fetchData()
            return true
        } catch (err) {
            console.error("Update customer error:", err)
            setError("Failed to update customer")
            return false
        }
    }

    const deleteCustomer = async (id: string) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/customers/${id}`, {
                method: "DELETE",
                headers,
            })
            if (!res.ok) throw new Error("Failed to delete customer")
            await fetchData()
            return true
        } catch (err) {
            console.error("Delete customer error:", err)
            setError("Failed to delete customer")
            return false
        }
    }

    // Rental operations
    const createRental = async (data: Partial<Rental>) => {
        try {
            const headers = getAuthHeaders()
            const body = toSnake(data)
            console.log("Creating rental with data:", body)
            const res = await fetch(`${API_BASE_URL}/inventory/rentals`, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                console.error("Create rental failed:", res.status, errorData)
                throw new Error(errorData.detail || "Failed to create rental")
            }
            await fetchData()
            return true
        } catch (err) {
            console.error("Create rental error:", err)
            setError(err instanceof Error ? err.message : "Failed to create rental")
            return false
        }
    }

    const returnRental = async (id: string, conditionNotes?: string) => {
        try {
            const headers = getAuthHeaders()
            const body = conditionNotes ? { condition_notes: conditionNotes } : {}
            const res = await fetch(`${API_BASE_URL}/inventory/rentals/${id}/return`, {
                method: "PUT",
                headers,
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                console.error("Return rental failed:", res.status, errorData)
                throw new Error(errorData.detail || "Failed to return rental")
            }
            await fetchData()
            return true
        } catch (err) {
            console.error("Return rental error:", err)
            setError(err instanceof Error ? err.message : "Failed to return rental")
            return false
        }
    }

    const updateRental = async (id: string, data: Partial<Rental>) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/rentals/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(toSnake(data)),
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                console.error("Update rental failed:", res.status, errorData)
                throw new Error(errorData.detail || "Failed to update rental")
            }
            await fetchData()
            return true
        } catch (err) {
            console.error("Update rental error:", err)
            setError(err instanceof Error ? err.message : "Failed to update rental")
            return false
        }
    }

    const deleteRental = async (id: string) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/rentals/${id}`, {
                method: "DELETE",
                headers,
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                console.error("Delete rental failed:", res.status, errorData)
                throw new Error(errorData.detail || "Failed to delete rental")
            }
            await fetchData()
            return true
        } catch (err) {
            console.error("Delete rental error:", err)
            setError(err instanceof Error ? err.message : "Failed to delete rental")
            return false
        }
    }

    // Sale operations
    const createSale = async (data: Partial<Sale>) => {
        try {
            const headers = getAuthHeaders()
            const body = toSnake(data)
            const res = await fetch(`${API_BASE_URL}/inventory/sales`, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                console.error("Create sale failed:", res.status, errorData)
                throw new Error(errorData.detail || "Failed to create sale")
            }
            await fetchData()
            return true
        } catch (err) {
            console.error("Create sale error:", err)
            setError(err instanceof Error ? err.message : "Failed to create sale")
            return false
        }
    }

    const updateSale = async (id: string, data: Partial<Sale>) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/sales/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(toSnake(data)),
            })
            if (!res.ok) throw new Error("Failed to update sale")
            await fetchData()
            return true
        } catch (err) {
            console.error("Update sale error:", err)
            setError("Failed to update sale")
            return false
        }
    }

    const deleteSale = async (id: string) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/inventory/sales/${id}`, {
                method: "DELETE",
                headers,
            })
            if (!res.ok) throw new Error("Failed to delete sale")
            await fetchData()
            return true
        } catch (err) {
            console.error("Delete sale error:", err)
            setError("Failed to delete sale")
            return false
        }
    }

    return {
        products,
        suppliers,
        customers,
        rentals,
        sales,
        loading,
        error,
        refresh: fetchData,
        // Product operations
        createProduct,
        updateProduct,
        deleteProduct,
        // Supplier operations
        createSupplier,
        updateSupplier,
        deleteSupplier,
        // Customer operations
        createCustomer,
        updateCustomer,
        deleteCustomer,
        // Rental operations
        createRental,
        updateRental,
        deleteRental,
        returnRental,
        // Sale operations
        createSale,
        updateSale,
        deleteSale,
    }
}
