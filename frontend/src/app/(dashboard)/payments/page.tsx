
"use client"

import { useState } from "react"
import { PaymentsView } from "@/components/payments/PaymentsView"
import { Modal } from "@/components/ui/Modal"
import { CreditPurchaseForm } from "@/components/payments/forms/CreditPurchaseForm"
import { CreditAdjustmentForm } from "@/components/payments/forms/CreditAdjustmentForm"
import { InventoryPaymentForm } from "@/components/payments/forms/InventoryPaymentForm"
import { usePayments } from "@/hooks/usePayments"
import { usePeople } from "@/hooks/usePeople"

export default function PaymentsPage() {
    const {
        transactions,
        balances,
        loading: paymentsLoading,
        refresh,
        purchaseCredits,
        adjustCredits,
        processInventoryPayment
    } = usePayments()

    const {
        students,
        teachers,
        instruments,
        loading: peopleLoading
    } = usePeople()

    const [activeModal, setActiveModal] = useState<'purchase' | 'adjustment' | 'inventory' | null>(null)
    const [selectedStudentForCredit, setSelectedStudentForCredit] = useState<string | null>(null)

    const loading = paymentsLoading || peopleLoading

    // Derive enrollments from balances (as balances cover all active enrollments)
    const enrollments = balances.map(b => ({
        id: b.enrollmentId,
        studentId: b.studentId,
        teacherId: b.teacherId,
        instrumentId: b.instrumentId
    }))

    const handleAddCreditPurchase = () => setActiveModal('purchase')
    const handleAddAdjustment = () => setActiveModal('adjustment')
    const handleAddInventoryPayment = () => setActiveModal('inventory')

    const handleAddCreditsForStudent = (studentId: string, enrollmentId: string) => {
        // We could pre-select, but for now just open purchase modal
        // Ideally pass initial state to modal/form, but keeping it simple
        setActiveModal('purchase')
    }

    const handleCloseModal = () => setActiveModal(null)

    if (loading && transactions.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-slate-500">Loading payments data...</div>
            </div>
        )
    }

    return (
        <>
            <PaymentsView
                transactions={transactions}
                balances={balances}
                students={students}
                teachers={teachers}
                instruments={instruments}
                enrollments={enrollments}
                onViewTransaction={(id) => console.log("View transaction", id)}
                onViewStudentHistory={(id) => console.log("View student history", id)}
                onAddCreditPurchase={handleAddCreditPurchase}
                onAddAdjustment={handleAddAdjustment}
                onAddInventoryPayment={handleAddInventoryPayment}
                onAddCreditsForStudent={handleAddCreditsForStudent}
            />

            {/* Credit Purchase Modal */}
            <Modal
                isOpen={activeModal === 'purchase'}
                onClose={handleCloseModal}
                title="Purchase Credits"
            >
                <CreditPurchaseForm
                    students={students}
                    enrollments={enrollments}
                    teachers={teachers}
                    instruments={instruments}
                    onSubmit={async (data) => {
                        const success = await purchaseCredits(data)
                        if (success) handleCloseModal()
                    }}
                    onCancel={handleCloseModal}
                />
            </Modal>

            {/* Credit Adjustment Modal */}
            <Modal
                isOpen={activeModal === 'adjustment'}
                onClose={handleCloseModal}
                title="Adjust Credits"
            >
                <CreditAdjustmentForm
                    students={students}
                    enrollments={enrollments}
                    onSubmit={async (data) => {
                        const success = await adjustCredits(data)
                        if (success) handleCloseModal()
                    }}
                    onCancel={handleCloseModal}
                />
            </Modal>

            {/* Inventory Payment Modal */}
            <Modal
                isOpen={activeModal === 'inventory'}
                onClose={handleCloseModal}
                title="Inventory Payment"
            >
                <InventoryPaymentForm
                    customers={students}
                    onSubmit={async (data) => {
                        const success = await processInventoryPayment(data)
                        if (success) handleCloseModal()
                    }}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </>
    )
}
