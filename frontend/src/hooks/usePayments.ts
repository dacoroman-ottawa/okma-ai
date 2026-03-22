
"use client"

import { useState, useEffect, useCallback } from "react"
import type { Transaction, StudentBalance } from "../types/payments"
import { toCamel, toSnake } from "@/lib/utils"

export function usePayments() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [balances, setBalances] = useState<StudentBalance[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const getAuthHeaders = async () => {
        try {
            // Get Token (using same logic as useClasses/usePeople)
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
                "Content-Type": "application/json"
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

            const [trxRes, balRes] = await Promise.all([
                fetch("http://localhost:8000/payments/transactions", { headers }),
                fetch("http://localhost:8000/payments/balances", { headers }),
            ])

            if (!trxRes.ok || !balRes.ok) throw new Error("Failed to fetch data")

            const trxData = toCamel(await trxRes.json())
            const balData = toCamel(await balRes.json())

            setTransactions(trxData)
            setBalances(balData)
            setError(null)
        } catch (err) {
            console.error("Fetch payments error:", err)
            setError("Failed to load payments data")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const purchaseCredits = async (data: any) => {
        try {
            const headers = await getAuthHeaders()
            const res = await fetch("http://localhost:8000/payments/credits/purchase", {
                method: "POST",
                headers,
                body: JSON.stringify(toSnake(data))
            })
            if (!res.ok) throw new Error("Failed to purchase credits")
            await fetchData()
            return true
        } catch (err) {
            console.error("Purchase credits error:", err)
            setError("Failed to process purchase")
            return false
        }
    }

    const adjustCredits = async (data: any) => {
        try {
            const headers = await getAuthHeaders()
            const res = await fetch("http://localhost:8000/payments/credits/adjustment", {
                method: "POST",
                headers,
                body: JSON.stringify(toSnake(data))
            })
            if (!res.ok) throw new Error("Failed to adjust credits")
            await fetchData()
            return true
        } catch (err) {
            console.error("Adjust credits error:", err)
            setError("Failed to process adjustment")
            return false
        }
    }

    const processInventoryPayment = async (data: any) => {
        try {
            const headers = await getAuthHeaders()
            const res = await fetch("http://localhost:8000/payments/inventory", {
                method: "POST",
                headers,
                body: JSON.stringify(toSnake(data))
            })
            if (!res.ok) throw new Error("Failed to process inventory payment")
            await fetchData()
            return true
        } catch (err) {
            console.error("Inventory payment error:", err)
            setError("Failed to process inventory payment")
            return false
        }
    }

    const updateTransaction = async (id: string, data: any) => {
        try {
            const headers = await getAuthHeaders()
            const res = await fetch(`http://localhost:8000/payments/transactions/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(toSnake(data))
            })
            if (!res.ok) throw new Error("Failed to update transaction")
            await fetchData()
            return true
        } catch (err) {
            console.error("Update transaction error:", err)
            setError("Failed to update transaction")
            return false
        }
    }

    const deleteTransaction = async (id: string) => {
        try {
            const headers = await getAuthHeaders()
            const res = await fetch(`http://localhost:8000/payments/transactions/${id}`, {
                method: "DELETE",
                headers
            })
            if (!res.ok) throw new Error("Failed to delete transaction")
            await fetchData()
            return true
        } catch (err) {
            console.error("Delete transaction error:", err)
            setError("Failed to delete transaction")
            return false
        }
    }

    return {
        transactions,
        balances,
        loading,
        error,
        refresh: fetchData,
        purchaseCredits,
        adjustCredits,
        processInventoryPayment,
        updateTransaction,
        deleteTransaction
    }
}
