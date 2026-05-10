
"use client"

import { useState, useEffect, useCallback } from "react"
import type { Transaction, StudentBalance } from "../types/payments"
import { toCamel, toSnake, getAuthHeaders, API_BASE_URL } from "@/lib/utils"

export function usePayments() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [balances, setBalances] = useState<StudentBalance[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const headers = getAuthHeaders()

            const [trxRes, balRes] = await Promise.all([
                fetch(`${API_BASE_URL}/payments/transactions`, { headers }),
                fetch(`${API_BASE_URL}/payments/balances`, { headers }),
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
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/payments/credits/purchase`, {
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
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/payments/credits/adjustment`, {
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
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/payments/inventory`, {
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
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/payments/transactions/${id}`, {
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
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/payments/transactions/${id}`, {
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
