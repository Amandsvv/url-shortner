export const cacheKeys = {
    url: (shortCode: string) => `url:${shortCode}`,

    clicks: (shortCode: string) => `url:clicks:${shortCode}`,

    clicksProcessing: (
        batchId: string,
        shortCode: string,
    ) => `url:clicks:processing:${batchId}:${shortCode}`,

    oauthState: (state: string) => `oauth:state:${state}`,

    guestCreateRateLimit: (ip: string) =>
        `rate-limit:guest-create:${ip}`,
};