"use client"

import { useDashboard } from "@/hooks/useDashboard"
import { DashboardView } from "@/components/dashboard"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
    const router = useRouter()
    const {
        metrics,
        todaysClasses,
        upcomingClasses,
        creditAlerts,
        inventoryAlerts,
        loading,
        error,
    } = useDashboard()

    const handleViewClass = (classId: string) => {
        router.push(`/classes?highlight=${classId}`)
    }

    const handleViewStudent = (studentId: string) => {
        router.push(`/people?tab=students&highlight=${studentId}`)
    }

    const handleViewInventoryAlert = (alertId: string) => {
        // Parse alert ID to determine if it's low stock or overdue rental
        if (alertId.startsWith("low-stock-")) {
            const productId = alertId.replace("low-stock-", "")
            router.push(`/inventory?tab=products&highlight=${productId}`)
        } else if (alertId.startsWith("overdue-")) {
            const rentalId = alertId.replace("overdue-", "")
            router.push(`/inventory?tab=rentals&highlight=${rentalId}`)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-900/20">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <DashboardView
            metrics={metrics}
            todaysClasses={todaysClasses}
            upcomingClasses={upcomingClasses}
            creditAlerts={creditAlerts}
            inventoryAlerts={inventoryAlerts}
            onViewClass={handleViewClass}
            onViewStudent={handleViewStudent}
            onViewInventoryAlert={handleViewInventoryAlert}
        />
    )
}
