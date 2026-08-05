export function CacheTTLSeconds(
    expiresAt?: Date | null,
): number {
    const DEFAULT_TTL_SECONDS = 60 * 60 * 24;

    if (!expiresAt) return DEFAULT_TTL_SECONDS;

    const seconds =
        Math.floor(
            (expiresAt.getTime() - Date.now()) / 1000
        );

    return Math.max(0, Math.min(DEFAULT_TTL_SECONDS, seconds));
}