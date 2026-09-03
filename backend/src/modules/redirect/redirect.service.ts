import { ApiError } from "../../utils/ApiError.js";
import { findRedirectDataByShortCode } from "./redirect.repository.js";
import { redisService } from "../../infrastructure/redis/redis.services.js";
import { cacheKeys } from "../../infrastructure/redis/cache-keys.js";
import { CacheTTLSeconds } from "../../utils/redirectTTL.js";
import { logger } from "../../config/logger.js";

type RedirectData =
    Awaited<
        ReturnType<typeof findRedirectDataByShortCode>
    >;

function validateRedirect(data: RedirectData) {
    if (!data)
        return;

    if (!data.active) {
        throw new ApiError(404, "Short Url is inactive");
    }

    if (data.expiresAt && +data.expiresAt <= Date.now()) {
        throw new ApiError(410, "Short Url got expired");
    }
}

export async function resolveRedirectUrl(shortCode: string) {
    const cacheKey = cacheKeys.url(shortCode);

    const redisData = await redisService.get<RedirectData>(cacheKey);

    if (redisData) {
        validateRedirect(redisData);

        logger.debug("Redirect cache hit", {
            shortCode,
        });

        const clickCount = await redisService.incr(
            cacheKeys.clicks(shortCode),
        );

        logger.info("Click recorded", {
            shortCode,
            clickCount
        });

        return redisData.originalUrl;
    }

    logger.debug("Redirect cache miss", {
        shortCode,
    });

    const redirectData = await findRedirectDataByShortCode(shortCode);

    if (redirectData === null) {
        throw new ApiError(404, "Short Url not found")
    }

    validateRedirect(redirectData);

    const ttlSeconds = CacheTTLSeconds(redirectData.expiresAt);

    await redisService.set(cacheKey, redirectData, ttlSeconds);

    const clickCount = await redisService.incr(
        cacheKeys.clicks(shortCode),
    );

    logger.info("Click recorded", {
        shortCode,
        clickCount,
    });

    return redirectData.originalUrl;
}