import { redis, redisAvailable } from "../../config/redis.js";
import { logger } from "../../config/logger.js";
import { serializeError } from "../../utils/serialize-error.js";

class RedisService {
    async get<T>(key: string): Promise<T | null> {
        if (!redisAvailable) {
            return null;
        }
        try {
            const value = await redis.get(key);

            if (!value) {
                return null;
            }
            
            return JSON.parse(value) as T;
        } catch (error) {
            logger.warn("Redis GET failed", {
                key,
                error: serializeError(error),
            });

            return null;
        }
    }

    async set(
        key: string,
        value: unknown,
        ttlSeconds?: number,
    ): Promise<void> {
        if (!redisAvailable) {
            return;
        }
        try {

            const payload = JSON.stringify(value);

            if (ttlSeconds !== undefined) {
                await redis.set(key, payload, {
                    EX: ttlSeconds,
                });

                return;
            }

            await redis.set(key, payload);

        } catch (error) {

            logger.warn("Redis SET failed", {
                key,
                error: serializeError(error),
            });

        }

    }

    async del(key: string): Promise<void> {
        if (!redisAvailable) {
            return;
        }
        try {

            await redis.del(key);

        } catch (error) {

            logger.warn("Redis DEL failed", {
                key,
                error: serializeError(error),
            });

        }

    }
}

export const redisService = new RedisService();