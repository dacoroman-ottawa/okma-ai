"use client"

import { useState, useEffect, useCallback } from "react"
import type {
    DashboardMetrics,
    TodaysClass,
    UpcomingClass,
    CreditAlert,
    InventoryAlert,
} from "../types/dashboard"
import { toCamel } from "@/lib/utils"

export function useDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        classesToday: 0,
        studentsEnrolled: 0,
        activeRentals: 0,
        lowStockCount: 0,
    })
    const [todaysClasses, setTodaysClasses] = useState<TodaysClass[]>([])
    const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])
    const [creditAlerts, setCreditAlerts] = useState<CreditAlert[]>([])
    const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([])
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

            const res = await fetch("http://localhost:8000/dashboard/summary", { headers })

            if (!res.ok) {
                throw new Error("Failed to fetch dashboard data")
            }

            const data = await res.json()
            const camelData = toCamel(data)

            setMetrics(camelData.metrics)
            setTodaysClasses(camelData.todaysClasses)
            setUpcomingClasses(camelData.upcomingClasses)
            setCreditAlerts(camelData.creditAlerts)
            setInventoryAlerts(camelData.inventoryAlerts)
            setError(null)
        } catch (err) {
            console.error("Fetch dashboard error:", err)
            setError("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        metrics,
        todaysClasses,
        upcomingClasses,
        creditAlerts,
        inventoryAlerts,
        loading,
        error,
        refresh: fetchData,
    }
}
