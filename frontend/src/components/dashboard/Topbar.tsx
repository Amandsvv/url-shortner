export function Topbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-white px-6">
            <div className="flex items-center gap-4">
                <span className="text-lg font-semibold tracking-tight">
                    shortest
                </span>

                <button
                    type="button"
                    className="rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-xs font-medium text-black"
                >
                    Upgrade
                </button>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-xs"
                >
                    ?
                </button>

                <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-xs"
                >
                    ⚙
                </button>
            </div>
        </header>
    );
}