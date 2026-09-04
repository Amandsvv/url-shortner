"use client";

import { AuthProvider } from "@/context/AuthContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-[var(--color-page)]">
                <Topbar />

                <div className="flex">
                    <Sidebar />

                    <main className="min-w-0 flex-1 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}