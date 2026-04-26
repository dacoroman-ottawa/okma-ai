"use client";

import { useState, useEffect } from "react";
import type { AppUser, CreateUserData, UpdateUserData } from "@/types/users";
import { toCamel, getAuthToken, API_BASE_URL } from "@/lib/utils";

export function useUsers() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = getAuthToken();

            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error("Failed to fetch users");
            }

            const data = toCamel(await res.json());
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createUser = async (data: CreateUserData) => {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to create user");
        }

        const newUser = toCamel(await res.json());
        setUsers((prev) => [...prev, newUser]);
        return newUser;
    };

    const updateUser = async (id: string, data: UpdateUserData) => {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to update user");
        }

        const updatedUser = toCamel(await res.json());
        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u))
        );
        return updatedUser;
    };

    const deleteUser = async (id: string) => {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to delete user");
        }

        setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    const toggleStatus = async (id: string) => {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/users/${id}/toggle-status`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to toggle status");
        }

        const updatedUser = toCamel(await res.json());
        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u))
        );
        return updatedUser;
    };

    const sendResetLink = async (id: string) => {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/users/${id}/send-reset-link`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to send reset link");
        }

        return true;
    };

    const getUser = (id: string) => users.find((u) => u.id === id);

    return {
        users,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        toggleStatus,
        sendResetLink,
        getUser,
        refetch: fetchUsers
    };
}
