"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { ApiClientError } from "@/lib/api";
import {
    UrlItem,
    UserUrlsResponse,
} from "@/types/url";

import CreateUrlModal from "@/components/dashboard/urls/CreateUrlModal";
import UrlTable from "@/components/dashboard/urls/UrlTable";
import UrlPagination from "@/components/dashboard/urls/UrlPagination";
import EmptyUrls from "@/components/dashboard/urls/EmptyUrls";
import ManageUrlModal from "@/components/dashboard/urls/ManageUrlModal";

export default function UserUrlsPage() {
    const {
        authFetch,
        loading: authLoading,
    } = useAuth();

    const [items, setItems] = useState<UrlItem[]>([]);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [totalPages, setTotalPages] = useState(0);
    const [totalUrls, setTotalUrls] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedUrl, setSelectedUrl] = useState<UrlItem | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        let cancelled = false;

        const fetchUrls = async () => {
            setLoading(true);
            setError("");

            try {
                const response =
                    await authFetch<UserUrlsResponse>(
                        `/api/v1/user/urls?page=${page}&limit=${limit}`,
                    );

                if (cancelled) {
                    return;
                }

                setItems(response.data.items);
                setTotalPages(
                    response.data.totalPages,
                );
                setTotalUrls(
                    response.data.totalUrls,
                );
            } catch (error) {
                if (cancelled) {
                    return;
                }

                if (error instanceof ApiClientError) {
                    setError(error.message);
                } else {
                    setError(
                        "Failed to load URLs.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void fetchUrls();

        return () => {
            cancelled = true;
        };
    }, [authLoading, authFetch, page, limit, refreshKey]);

    const refreshUrls = () => {
        setRefreshKey((current) => current + 1);
        setPage(1);
    };

    if (authLoading || loading) {
        return (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-8">
                <p className="text-sm text-(--color-muted)">
                    Loading your URLs...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error}
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-(--color-muted)">
                        URLs
                    </p>

                    <h1 className="mt-2 text-3xl font-medium tracking-tight">
                        My URLs
                    </h1>

                    <p className="mt-2 text-sm text-(--color-muted)">
                        {totalUrls} URL
                        {totalUrls === 1 ? "" : "s"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setIsCreateModalOpen(true)
                    }
                    className="rounded-full bg-[var(--color-dark)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                    Create Short URL
                </button>
            </div>

            <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white">
                {items.length === 0 ? (
                    <EmptyUrls
                        onCreate={() =>
                            setIsCreateModalOpen(true)
                        }
                    />
                ) : (
                    <UrlTable
                        items={items}
                        onManage={(item) => {
                            setSelectedUrl(item);
                        }}
                    />
                )}

                <UrlPagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>

            <ManageUrlModal
                key={selectedUrl?.id ?? "manage-url"}
                url={selectedUrl}
                onClose={() => setSelectedUrl(null)}
                onUpdated={refreshUrls}
            />

            <CreateUrlModal
                isOpen={isCreateModalOpen}
                onClose={() =>
                    setIsCreateModalOpen(false)
                }
                onCreated={refreshUrls}
            />
        </div>
    );
}