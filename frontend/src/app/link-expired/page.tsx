import Link from "next/link";

export default function LinkExpiredPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--color-page)] px-6">
            <div className="w-full max-w-md text-center">
                <p className="text-sm font-medium tracking-wide text-[var(--color-muted)]">
                    Shortest
                </p>

                <h1 className="mt-4 text-4xl font-medium tracking-tight">
                    Link expired
                </h1>

                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                    This short URL is no longer available.
                </p>

                <Link
                    href="/"
                    className="mt-6 inline-flex rounded-full bg-[var(--color-dark)] px-5 py-2.5 text-sm font-medium text-white"
                >
                    Go to Shortest
                </Link>
            </div>
        </main>
    );
}