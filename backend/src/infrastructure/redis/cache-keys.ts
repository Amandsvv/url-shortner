export const cacheKeys = {
    url: (shortCode: string) => `url:${shortCode}`,
    clicks: (shortCode: string) => `url:clicks:${shortCode}`,
    oauthState: (state: string) => `oauth:state:${state}`,
};