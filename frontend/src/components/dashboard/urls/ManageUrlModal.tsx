"use client";
import { useState } from "react";

import { ApiClientError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { UrlItem } from "@/types/url";

type ManageUrlModalProps = {
    url: UrlItem | null;
    onClose: () => void;
    onUpdated: () => void;
};

export default function ManageUrlModal({
    url,
    onClose,
    onUpdated,
}: ManageUrlModalProps) {
    const { authFetch } = useAuth();

    const [editedUrl, setEditedUrl] = useState(
        url?.originalUrl ?? "",
    );

    const [managing, setManaging] = useState(false);
    const [error, setError] = useState("");
    const [deleteConfirm, setDeleteConfirm] =
        useState(false);

    if (!url) {
        return null;
    }

    const handleUpdate = async () => {
        const trimmedUrl = editedUrl.trim();

        if (!trimmedUrl) {
            setError(
                "Please enter a destination URL.",
            );
            return;
        }

        if (trimmedUrl === url.originalUrl) {
            setError("No changes to save.");
            return;
        }

        try {
            setManaging(true);
            setError("");

            await authFetch(
                `/api/v1/user/urls/${url.id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        originalUrl: trimmedUrl,
                    }),
                },
            );

            onClose();
            onUpdated();
        } catch (error) {
            if (error instanceof ApiClientError) {
                setError(error.message);
            } else {
                setError(
                    "Failed to update the URL.",
                );
            }
        } finally {
            setManaging(false);
        }
    };

    const handleToggle = async () => {
        try {
            setManaging(true);
            setError("");

            await authFetch(
                `/api/v1/user/urls/${url.id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        active: !url.active,
                    }),
                },
            );

            onClose();
            onUpdated();
        } catch (error) {
            if (error instanceof ApiClientError) {
                setError(error.message);
            } else {
                setError(
                    "Failed to update the URL status.",
                );
            }
        } finally {
            setManaging(false);
        }
    };

    const handleDelete = async () => {
        try {
            setManaging(true);
            setError("");

            await authFetch(
                `/api/v1/user/urls/${url.id}`,
                {
                    method: "DELETE",
                },
            );

            onClose();
            onUpdated();
        } catch (error) {
            if (error instanceof ApiClientError) {
                setError(error.message);
            } else {
                setError(
                    "Failed to delete the URL.",
                );
            }
        } finally {
            setManaging(false);
        }
    };

    const handleClose = () => {
        if (managing) {
            return;
        }

        setError("");
        setDeleteConfirm(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="manage-url-title"
                className="w-full max-w-lg rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-xl"
            >
                <div className="mb-6">
                    <h2
                        id="manage-url-title"
                        className="text-xl font-semibold"
                    >
                        Manage URL
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                        Update or manage this shortened URL.
                    </p>
                </div>

                <div className="mb-5">
                    <p className="mb-2 text-sm font-medium">
                        Short URL
                    </p>

                    <a
                        href={`${process.env.NEXT_PUBLIC_APP_URL}/${url.shortCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-sm font-medium underline underline-offset-4"
                    >
                        {process.env.NEXT_PUBLIC_APP_URL}/{url.shortCode}
                    </a>
                </div>

                <div>
                    <label
                        htmlFor="manage-destination-url"
                        className="mb-2 block text-sm font-medium"
                    >
                        Destination URL
                    </label>

                    <input
                        id="manage-destination-url"
                        type="url"
                        value={editedUrl}
                        onChange={(event) =>
                            setEditedUrl(
                                event.target.value,
                            )
                        }
                        disabled={managing}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-dark)]"
                    />
                </div>

                <div className="mt-5 flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3">
                    <div>
                        <p className="text-sm font-medium">
                            Status
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-muted)]">
                            {url.active
                                ? "This URL can currently redirect."
                                : "This URL is disabled."}
                        </p>
                    </div>

                    <span
                        className={
                            url.active
                                ? "rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-medium text-black"
                                : "rounded-full bg-[#ececea] px-3 py-1 text-xs font-medium text-[var(--color-muted)]"
                        }
                    >
                        {url.active
                            ? "Active"
                            : "Disabled"}
                    </span>
                </div>

                {error && (
                    <p className="mt-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {deleteConfirm ? (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">
                            Delete this URL permanently?
                        </p>

                        <p className="mt-1 text-xs text-red-700">
                            This action cannot be undone.
                        </p>

                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteConfirm(
                                        false,
                                    )
                                }
                                disabled={managing}
                                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={managing}
                                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                                {managing
                                    ? "Deleting..."
                                    : "Delete permanently"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setDeleteConfirm(true)
                            }
                            disabled={managing}
                            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                            Delete permanently
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={managing}
                                className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleToggle}
                                disabled={managing}
                                className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                            >
                                {url.active
                                    ? "Disable"
                                    : "Enable"}
                            </button>

                            <button
                                type="button"
                                onClick={handleUpdate}
                                disabled={managing}
                                className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-dark)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {managing
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}