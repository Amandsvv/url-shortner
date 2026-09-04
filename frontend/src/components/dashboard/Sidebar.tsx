"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navigation = [
    {
        section: "Settings",
        items: [
            { label: "Profile", href: "/dashboard" },
        ],
    },
    {
        section: "URLs",
        items: [
            { label: "My URLs", href: "/dashboard/urls" },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const planName =
        user?.plan === "PRO"
            ? "Pro Plan"
            : "Free Plan";

    async function handleLogout() {
        setLoggingOut(true);
        setLogoutError("");

        try {
            await logout();
            router.replace("/");
        } catch (error) {
            setLogoutError(
                error instanceof Error
                    ? error.message
                    : "Unable to log out. Please try again.",
            );
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <aside className="w-56 shrink-0 border-r border-[var(--color-border)] bg-white">
            <div className="flex min-h-[calc(100vh-4rem)] flex-col">

                <div className="flex-1 px-5 py-7">
                    {navigation.map((section) => (
                        <div
                            key={section.section}
                            className="mb-8"
                        >
                            <p className="px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
                                {section.section}
                            </p>

                            <nav className="mt-3 space-y-1">
                                {section.items.map((item) => {
                                    const active =
                                        item.href === "/dashboard"
                                            ? pathname === item.href
                                            : pathname.startsWith(item.href);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`block rounded-lg px-3 py-2 text-sm transition ${active
                                                ? "bg-[var(--color-accent)] font-medium text-black"
                                                : "text-[var(--color-muted)] hover:bg-[var(--color-page)] hover:text-[var(--color-text)]"
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* User profile + logout */}
                <div className="border-t border-[var(--color-border)] p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[var(--color-dark)]">
                            {user?.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    width={44}
                                    height={44}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-white">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                                {user?.name}
                            </p>

                            <p className="mt-1 text-xs text-[var(--color-muted)]">
                                {planName}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => void handleLogout()}
                        disabled={loggingOut}
                        className="mt-4 flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-muted)] transition hover:bg-[#ececea] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loggingOut ? "Logging out..." : "Logout"}
                    </button>

                    {logoutError && (
                        <p className="mt-2 text-xs text-red-600" role="alert">
                            {logoutError}
                        </p>
                    )}
                </div>
            </div>
        </aside>
    );
}