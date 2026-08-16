export const cacheKeys = {
    url: (shortCode: string) => `url:${shortCode}`,
    oauthState: (state: string) => `oauth:state:${state}`,
};