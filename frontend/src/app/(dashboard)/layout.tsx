"use client";

import { usePathname, useRouter } from "next/navigation";
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

    const items = navigationItems.map((item) => ({
        ...item,
        isActive: pathname.startsWith(item.href) || (item.href === "/dashboard" && pathname === "/"),
    }));

    return (
        <AppShell
            navigationItems={items}
            onNavigate={(href) => router.push(href)}
            user={{ name: "Admin User" }}
            onLogout={() => console.log("Logout triggered")}
        >
            {children}
        </AppShell>
    );
}
