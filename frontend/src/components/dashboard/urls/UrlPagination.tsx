"use client";

type UrlPaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export default function UrlPagination({
    page,
    totalPages,
    onPageChange,
}: UrlPaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-6 py-4">
            <button
                type="button"
                disabled={page === 1}
                onClick={() =>
                    onPageChange(
                        Math.max(1, page - 1),
                    )
                }
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
                Previous
            </button>

            <p className="text-xs text-(--color-muted)">
                Page {page} of {totalPages}
            </p>

            <button
                type="button"
                disabled={page === totalPages}
                onClick={() =>
                    onPageChange(
                        Math.min(
                            totalPages,
                            page + 1,
                        ),
                    )
                }
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
                Next
            </button>
        </div>
    );
}