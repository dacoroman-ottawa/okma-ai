"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { UserProvider, useUser } from "@/contexts/UserContext";

const allNavigationItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "People", href: "/people" },
    { label: "Classes", href: "/classes" },
    { label: "Payments", href: "/payments" },
    { label: "Inventory", href: "/inventory" },
    { label: "Users", href: "/users" },
];

// Items that require admin access
const adminOnlyItems = ["Dashboard", "People", "Payments", "Inventory", "Users"];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAdmin, isLoading, logout } = useUser();

    // Redirect non-admin users away from admin-only pages
    useEffect(() => {
        if (!isLoading && !isAdmin) {
            if (pathname === "/" || pathname === "/dashboard") {
                router.replace("/classes");
            }
        }
    }, [isLoading, isAdmin, pathname, router]);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    // Filter navigation items based on user role
    const navigationItems = allNavigationItems.filter(item =>
        isAdmin || !adminOnlyItems.includes(item.label)
    );

    const items = navigationItems.map((item) => ({
        ...item,
        isActive: pathname.startsWith(item.href) || (item.href === "/dashboard" && pathname === "/"),
    }));

    return (
        <AppShell
            navigationItems={items}
            onNavigate={(href) => router.push(href)}
            user={{ name: user?.name || "User" }}
            onLogout={handleLogout}
        >
            {children}
        </AppShell>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </UserProvider>
    );
}
