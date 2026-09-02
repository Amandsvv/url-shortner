import { Request, Response, NextFunction } from "express";

import { redisService } from "../infrastructure/redis/redis.services.js";
import { cacheKeys } from "../infrastructure/redis/cache-keys.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/ApiError.js";

const GUEST_CREATE_LIMIT = 10;
const GUEST_CREATE_WINDOW_SECONDS = 24 * 60 * 60;

export async function guestCreateRateLimit(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const ip = req.ip;

    if (!ip) {
        throw new ApiError(400, "Unable to determine client IP.");
    }

    const key = cacheKeys.guestCreateRateLimit(ip);

    const result = await redisService.consumeRateLimit(
        key,
        GUEST_CREATE_LIMIT,
        GUEST_CREATE_WINDOW_SECONDS,
    );

    if (result === null) {
        logger.warn("Guest rate limiter unavailable", {
            ip,
        });

        next();
        return;
    }

    res.setHeader("X-RateLimit-Limit", GUEST_CREATE_LIMIT);
    res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, GUEST_CREATE_LIMIT - result.count),
    );

    if (!result.allowed) {
        res.setHeader("Retry-After", result.ttl);

        throw new ApiError(
            429,
            "Too many URL creation requests. Please try again later.",
        );
    }

    next();
}