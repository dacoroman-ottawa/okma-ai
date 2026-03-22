
"use client"

import { useState } from "react"
import { PaymentsView } from "@/components/payments/PaymentsView"
import { Modal } from "@/components/ui/Modal"
import { CreditAdjustmentForm } from "@/components/payments/forms/CreditAdjustmentForm"
import { InventoryPaymentForm } from "@/components/payments/forms/InventoryPaymentForm"
import { EditTransactionForm } from "@/components/payments/forms/EditTransactionForm"
import { usePayments } from "@/hooks/usePayments"
import { usePeople } from "@/hooks/usePeople"
import type { Transaction } from "@/types/payments"

export default function PaymentsPage() {
    const {
        transactions,
        balances,
        loading: paymentsLoading,
        refresh,
        purchaseCredits,
        adjustCredits,
        processInventoryPayment,
        updateTransaction,
        deleteTransaction
    } = usePayments()

    const {
        students,
        teachers,
        instruments,
        loading: peopleLoading
    } = usePeople()

    const [activeModal, setActiveModal] = useState<'purchase' | 'adjustment' | 'inventory' | 'edit' | null>(null)
    const [selectedStudentForCredit, setSelectedStudentForCredit] = useState<string | null>(null)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

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

    const handleEditTransaction = (id: string) => {
        const transaction = transactions.find(t => t.id === id)
        if (transaction && transaction.type !== 'deduction') {
            setEditingTransaction(transaction)
            setActiveModal('edit')
        }
    }

    const handleDeleteTransaction = async (id: string) => {
        await deleteTransaction(id)
    }

    const handleCloseModal = () => {
        setActiveModal(null)
        setEditingTransaction(null)
    }

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
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
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
                title="Credit Purchase"
            >
                <EditTransactionForm
                    mode="create"
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

            {/* Edit Transaction Modal */}
            <Modal
                isOpen={activeModal === 'edit'}
                onClose={handleCloseModal}
                title="Edit Transaction"
            >
                {editingTransaction && (
                    <EditTransactionForm
                        mode="edit"
                        transaction={editingTransaction}
                        students={students}
                        enrollments={enrollments}
                        teachers={teachers}
                        instruments={instruments}
                        onSubmit={async (data) => {
                            const success = await updateTransaction(editingTransaction.id, data)
                            if (success) handleCloseModal()
                        }}
                        onCancel={handleCloseModal}
                    />
                )}
            </Modal>
        </>
    )
}
