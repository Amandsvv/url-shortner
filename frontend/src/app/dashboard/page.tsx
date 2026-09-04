"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

type StatsResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        activeUrls: number;
        totalClicks: number;
    };
};

export default function DashboardPage() {
    const { authFetch, user } = useAuth();

    const [stats, setStats] = useState({
        activeUrls: 0,
        totalClicks: 0,
    });

    const [statsLoading, setStatsLoading] =
        useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                setStatsLoading(true);

                const response =
                    await authFetch<StatsResponse>(
                        "/api/v1/user/stats",
                    );

                setStats(response.data);
            } catch (error) {
                console.error(
                    "Failed to load dashboard stats",
                    error,
                );
            } finally {
                setStatsLoading(false);
            }
        };

        void loadStats();
    }, [authFetch]);

    return (
        <section className="space-y-8">
            <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Overview
                </p>

                <h1 className="mt-2 text-3xl font-medium tracking-tight">
                    Welcome back{user?.name ? `, ${user.name}` : ""}
                </h1>

                <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Manage your account and shortened URLs from here.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-6">
                    <p className="mt-3 text-3xl font-medium">
                        {statsLoading ? "--" : stats.activeUrls}
                    </p>
                    
                </div>

                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-6">
                    <p className="mt-3 text-3xl font-medium">
                        {statsLoading ? "--" : stats.totalClicks}
                    </p>
                </div>

                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-6">
                    <p className="text-sm text-[var(--color-muted)]">
                        Plan
                    </p>
                    <p className="mt-3 text-3xl font-medium">
                        {user?.plan === "PRO" ? "Pro" : "Free"}
                    </p>
                </div>
            </div>
        </section>
    );
}
