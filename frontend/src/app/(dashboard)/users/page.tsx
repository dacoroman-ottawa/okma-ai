"use client";

import { useState } from "react";
import { UserAdministrationView, UserEditModal } from "@/components/users";
import { useUsers } from "@/hooks/useUsers";
import type { AppUser, CreateUserData, UpdateUserData } from "@/types/users";

export default function UsersPage() {
    const {
        users,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        toggleStatus,
        sendResetLink,
        getUser,
    } = useUsers();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

    const handleAddUser = () => {
        setSelectedUser(null);
        setModalMode("add");
        setModalOpen(true);
    };

    const handleEditUser = (userId: string) => {
        const user = getUser(userId);
        if (user) {
            setSelectedUser(user);
            setModalMode("edit");
            setModalOpen(true);
        }
    };

    const handleSaveUser = async (data: CreateUserData | UpdateUserData) => {
        if (modalMode === "add") {
            await createUser(data as CreateUserData);
        } else if (selectedUser) {
            await updateUser(selectedUser.id, data as UpdateUserData);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        const user = getUser(userId);
        if (!user) return;

        // For teacher or student roles, direct to the appropriate screen
        if (user.role === 'teacher') {
            alert("Delete this Teacher in the Teachers screen.");
            return;
        }
        if (user.role === 'student') {
            alert("Delete this Student in the Students screen.");
            return;
        }

        // For admin users, use window.confirm before deleting
        const confirmed = window.confirm(
            `Are you sure you want to delete ${user.name}? This action cannot be undone.`
        );

        if (confirmed) {
            try {
                await deleteUser(userId);
            } catch (error) {
                console.error("Failed to delete user:", error);
                alert("Failed to delete user. Please try again.");
            }
        }
    };

    const handleToggleStatus = async (userId: string) => {
        try {
            await toggleStatus(userId);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to toggle status");
        }
    };

    const handleSendResetLink = async (userId: string) => {
        try {
            await sendResetLink(userId);
            alert("Password reset link sent successfully");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to send reset link");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <UserAdministrationView
                users={users}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                onToggleStatus={handleToggleStatus}
                onSendResetLink={handleSendResetLink}
            />

            <UserEditModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveUser}
                user={selectedUser}
                mode={modalMode}
            />
        </>
    );
}
