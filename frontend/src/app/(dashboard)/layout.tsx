"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";

const navigationItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "People", href: "/people" },
    { label: "Classes", href: "/classes" },
    { label: "Payments", href: "/payments" },
    { label: "Inventory", href: "/inventory" },
    { label: "Users", href: "/users" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string } | null>(null);

    useEffect(() => {
        // Load user from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser({ name: parsed.name || "User" });
            } catch {
                setUser({ name: "Admin User" });
            }
        } else {
            setUser({ name: "Admin User" });
        }
    }, []);

    const handleLogout = () => {
        // Clear auth data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        // Redirect to login
        router.push("/login");
    };

    const items = navigationItems.map((item) => ({
        ...item,
        isActive: pathname.startsWith(item.href) || (item.href === "/dashboard" && pathname === "/"),
    }));

    return (
        <AppShell
            navigationItems={items}
            onNavigate={(href) => router.push(href)}
            user={user || { name: "User" }}
            onLogout={handleLogout}
        >
            {children}
        </AppShell>
    );
}
