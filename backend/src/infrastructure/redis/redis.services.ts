import { redis, redisAvailable } from "../../config/redis.js";
import { logger } from "../../config/logger.js";
import { serializeError } from "../../utils/serialize-error.js";

type RedisScanResult = {
    cursor: string;
    keys: string[];
};

type RateLimitResult = {
    count: number,
    allowed: boolean,
    ttl: number
};

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

    async incr(key: string): Promise<number | null> {
        if (!redisAvailable) {
            return null;
        }

        try {
            return await redis.incr(key);
        } catch (error) {
            logger.warn("Redis INCR failed", {
                key,
                error: serializeError(error),
            });

            return null;
        }
    }

    async scan(
        cursor: string,
        pattern: string,
        count: number,
    ): Promise<RedisScanResult | null> {
        if (!redisAvailable) {
            return null;
        }

        try {
            const result = await redis.scan(cursor, {
                MATCH: pattern,
                COUNT: count,
            });

            return {
                cursor: result.cursor,
                keys: result.keys,
            };
        } catch (error) {
            logger.warn("Redis SCAN failed", {
                cursor,
                pattern,
                count,
                error: serializeError(error),
            });

            return null;
        }
    }

    async getNumber(key: string): Promise<number | null> {
        if (!redisAvailable) {
            return null;
        }

        try {
            const value = await redis.get(key);

            if (value === null) {
                return null;
            }

            const count = Number(value);

            if (!Number.isInteger(count)) {
                logger.warn("Redis counter is not an integer", {
                    key,
                    value,
                });

                return null;
            }

            return count;
        } catch (error) {
            logger.warn("Redis GET NUMBER failed", {
                key,
                error: serializeError(error),
            });

            return null;
        }
    }

    async handoffClickCounter(
        activeKey: string,
        processingKey: string,
    ): Promise<number | null> {
        if (!redisAvailable) {
            return null;
        }

        const script = `
        local value = redis.call("GET", KEYS[1])

        if not value then
            return 0
        end

        if redis.call("EXISTS", KEYS[2]) == 1 then
            return -1
        end

        redis.call("SET", KEYS[2], value)
        redis.call("DEL", KEYS[1])

        return tonumber(value)
    `;

        try {
            const result = await redis.eval(script, {
                keys: [activeKey, processingKey],
            });

            return Number(result);
        } catch (error) {
            logger.warn("Redis click counter handoff failed", {
                activeKey,
                processingKey,
                error: serializeError(error),
            });

            return null;
        }
    }

    async consumeRateLimit(
        key: string,
        limit: number,
        windowSeconds: number,
    ): Promise<RateLimitResult | null> {
        if (!redisAvailable) {
            return null;
        }

        const script = `
        local count = redis.call("INCR", KEYS[1])

        if count == 1 then
            redis.call("EXPIRE", KEYS[1], ARGV[1])
        end

        local ttl = redis.call("TTL", KEYS[1])

        return { count, ttl }
    `;

        try {
            const result = await redis.eval(script, {
                keys: [key],
                arguments: [String(windowSeconds)],
            });

            const [count, ttl] = result as [number, number];

            return {
                count,
                allowed: count <= limit,
                ttl,
            };
        } catch (error) {
            logger.warn("Redis rate limiter failed", {
                key,
                error: serializeError(error),
            });

            return null;
        }
    }
}

export const redisService = new RedisService();