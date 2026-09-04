"use client";

type EmptyUrlsProps = {
    onCreate: () => void;
};

export default function EmptyUrls({
    onCreate,
}: EmptyUrlsProps) {
    return (
        <div className="p-10 text-center">
            <p className="text-sm font-medium">
                No URLs yet
            </p>

            <p className="mt-2 text-sm text-(--color-muted)">
                Create your first shortened URL.
            </p>

            <button
                type="button"
                onClick={onCreate}
                className="mt-5 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-dark)] transition hover:bg-[var(--color-accent-hover)]"
            >
                Create Short URL
            </button>
        </div>
    );
}