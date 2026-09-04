"use client";

import { useState } from "react";

import { ApiClientError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CreateUrlModalProps } from "@/types/url";

export default function CreateUrlModal({
    isOpen,
    onClose,
    onCreated,
}: CreateUrlModalProps) {
    const { authFetch } = useAuth();

    const [destinationUrl, setDestinationUrl] =
        useState("");

    const [creating, setCreating] =
        useState(false);

    const [error, setError] =
        useState("");

    if (!isOpen) {
        return null;
    }

    const handleClose = () => {
        if (creating) {
            return;
        }

        setDestinationUrl("");
        setError("");

        onClose();
        onCreated();
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const trimmedUrl = destinationUrl.trim();

        if (!trimmedUrl) {
            setError(
                "Please enter a destination URL.",
            );
            return;
        }

        try {
            setCreating(true);
            setError("");

            await authFetch(
                "/api/v1/urls/user",
                {
                    method: "POST",
                    body: JSON.stringify({
                        originalUrl: trimmedUrl,
                    }),
                },
            );

            setDestinationUrl("");
            setError("");

            onClose();
            await onCreated();
        } catch (err) {
            if (err instanceof ApiClientError) {
                if (err.statusCode === 403) {
                    setError(
                        "You've reached your 30 active URL limit.",
                    );
                } else {
                    setError(err.message);
                }
            } else {
                setError(
                    "Failed to create the short URL.",
                );
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-url-title"
                className="w-full max-w-lg rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-xl"
            >
                <div className="mb-6">
                    <h2
                        id="create-url-title"
                        className="text-xl font-semibold"
                    >
                        Create Short URL
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                        Your URL will remain active for
                        7 days.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label
                        htmlFor="destination-url"
                        className="mb-2 block text-sm font-medium"
                    >
                        Destination URL
                    </label>

                    <input
                        id="destination-url"
                        type="url"
                        placeholder="https://example.com/your-long-url"
                        value={destinationUrl}
                        onChange={(event) =>
                            setDestinationUrl(
                                event.target.value,
                            )
                        }
                        disabled={creating}
                        autoFocus
                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-dark)]"
                    />

                    {error && (
                        <p className="mt-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={creating}
                            className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={creating}
                            className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-dark)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating
                                ? "Creating..."
                                : "Create URL"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}