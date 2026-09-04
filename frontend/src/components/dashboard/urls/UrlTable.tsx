"use client";

import { UrlItem } from "@/types/url";

type UrlTableProps = {
    items: UrlItem[];
    onManage: (item: UrlItem) => void;
};

export default function UrlTable({
    items,
    onManage,
}: UrlTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
                <thead className="border-b border-[var(--color-border)]">
                    <tr>
                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-(--color-muted)">
                            Short URL
                        </th>

                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-(--color-muted)">
                            Destination
                        </th>

                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-(--color-muted)">
                            Status
                        </th>

                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-(--color-muted)">
                            Clicks
                        </th>

                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-(--color-muted)">
                            Expires
                        </th>

                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-(--color-muted)">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item) => (
                        <tr
                            key={item.id}
                            className="border-b border-[var(--color-border)] last:border-b-0"
                        >
                            <td className="px-6 py-5">
                                <a
                                    href={`${process.env.NEXT_PUBLIC_APP_URL}/${item.shortCode}`} target="_blank"
                                    rel="noreferrer"
                                    className="font-medium underline underline-offset-4"
                                >
                                    /{item.shortCode}
                                </a>
                            </td>

                            <td className="max-w-[320px] px-6 py-5">
                                <p className="truncate text-sm text-(--color-muted)">
                                    {item.originalUrl}
                                </p>
                            </td>

                            <td className="px-6 py-5">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs ${item.active
                                            ? "bg-[var(--color-accent)] text-black"
                                            : "bg-[#ececea] text-(--color-muted)"
                                        }`}
                                >
                                    {item.active
                                        ? "Active"
                                        : "Disabled"}
                                </span>
                            </td>

                            <td className="px-6 py-5 text-sm font-medium">
                                {item.clickCount}
                            </td>

                            <td className="px-6 py-5 text-sm text-(--color-muted)">
                                {new Date(
                                    item.expiresAt,
                                ).toLocaleDateString()}
                            </td>

                            <td className="px-6 py-5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        onManage(item)
                                    }
                                    className="text-sm underline underline-offset-4"
                                >
                                    Manage
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}