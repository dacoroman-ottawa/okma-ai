"use client"

import { useState, useEffect, useCallback } from "react"
import type {
    Product,
    Supplier,
    Customer,
    Rental,
    Sale,
} from "../types/inventory"
import { toCamel, toSnake } from "@/lib/utils"

export function useInventory() {
    const [products, setProducts] = useState<Product[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [rentals, setRentals] = useState<Rental[]>([])
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const getAuthHeaders = async () => {
        try {
            const tokenRes = await fetch("http://localhost:8000/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    username: "admin@kanatamusic.com",
                    password: "admin123",
                }),
            })
            if (!tokenRes.ok) throw new Error("Failed to get token")
            const { access_token } = await tokenRes.json()
            return {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
            }
        } catch (err) {
            console.error("Auth error:", err)
            throw err
        }
    }

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const headers = await getAuthHeaders()

            const [prodRes, suppRes, custRes, rentRes, salesRes] = await Promise.all([
                fetch("http://localhost:8000/inventory/products", { headers }),
                fetch("http://localhost:8000/inventory/suppliers", { headers }),
                fetch("http://localhost:8000/inventory/customers", { headers }),
                fetch("http://localhost:8000/inventory/rentals", { headers }),
                fetch("http://localhost:8000/inventory/sales", { headers }),
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
            const headers = await getAuthHeaders()
            const res = await fetch("http://localhost:8000/inventory/products", {
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
            const headers = await getAuthHeaders()
            const res = await fetch(`http://localhost:8000/inventory/products/${id}`, {
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
            const headers = await getAuthHeaders()
            const res = await fetch(`http://localhost:8000/inventory/products/${id}`, {
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
            const headers = await getAuthHeaders()
            const res = await fetch("http://localhost:8000/inventory/suppliers", {
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
            const headers = await getAuthHeaders()
            const res = await fetch(`http://localhost:8000/inventory/suppliers/${id}`, {
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
            const headers = await getAuthHeaders()
            const res = await fetch(`http://localhost:8000/inventory/suppliers/${id}`, {
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
            const headers = await getAuthHeaders()
            const res = await fetch("http://localhost:8000/inventory/customers", {
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
            const headers = await getAuthHeaders()
            const res = await fetch(`http://localhost:8000/inventory/customers/${id}`, {
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
            const headers = await getAuthHeaders()
            const res = await fetch(`http://localhost:8000/inventory/customers/${id}`, {
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
            const headers = await getAuthHeaders()
            const res = await fetch("http://localhost:8000/inventory/rentals", {
                method: "POST",
                headers,
                body: JSON.stringify(toSnake(data)),
            })
            if (!res.ok) throw new Error("Failed to create rental")
            await fetchData()
            return true
        } catch (err) {
            console.error("Create rental error:", err)
            setError("Failed to create rental")
            return false
        }
    }

    const returnRental = async (id: string, conditionNotes?: string) => {
        try {
            const headers = await getAuthHeaders()
            const res = await fetch(`http://localhost:8000/inventory/rentals/${id}/return`, {
                method: "PUT",
                headers,
                body: JSON.stringify(toSnake({ conditionNotes })),
            })
            if (!res.ok) throw new Error("Failed to return rental")
            await fetchData()
            return true
        } catch (err) {
            console.error("Return rental error:", err)
            setError("Failed to return rental")
            return false
        }
    }

    // Sale operations
    const recordSale = async (data: Partial<Sale>) => {
        try {
            const headers = await getAuthHeaders()
            const res = await fetch("http://localhost:8000/inventory/sales", {
                method: "POST",
                headers,
                body: JSON.stringify(toSnake(data)),
            })
            if (!res.ok) throw new Error("Failed to record sale")
            await fetchData()
            return true
        } catch (err) {
            console.error("Record sale error:", err)
            setError("Failed to record sale")
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
        returnRental,
        // Sale operations
        recordSale,
    }
}
