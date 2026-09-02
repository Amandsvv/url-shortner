import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool, } from "../../src/db/index.js";
import { urls } from "../../src/db/schema/urls.schema.js";
import { redisService } from "../../src/infrastructure/redis/redis.services.js";
import { cacheKeys } from "../../src/infrastructure/redis/cache-keys.js";
import { flushPendingClicks } from "../../src/modules/analytics/analytics.worker.js";

describe("Analytics", () => {
    it("flushes Redis click counts into PostgreSQL", async () => {
        const shortCode = "AbC123";

        await db.insert(urls).values({
            id: randomUUID(),
            shortCode,
            originalUrl: "https://example.com",
            ownerId: null,
            active: true,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            clickCount: 10,
        });

        await redisService.incr(cacheKeys.clicks(shortCode));
        await redisService.incr(cacheKeys.clicks(shortCode));
        await redisService.incr(cacheKeys.clicks(shortCode));
        await redisService.incr(cacheKeys.clicks(shortCode));
        await redisService.incr(cacheKeys.clicks(shortCode));

        await flushPendingClicks();

        const result = await pool.query(
            `SELECT click_count FROM urls WHERE short_code = $1`,
            [shortCode],
        );

        expect(result.rows[0].click_count).toBe(15);

        const redisCount = await redisService.getNumber(
            cacheKeys.clicks(shortCode),
        );

        expect(redisCount).toBeNull();
    });

    it("ignores pending clicks for a deleted URL", async () => {
        const shortCode = "Del123";

        await db.insert(urls).values({
            id: randomUUID(),
            shortCode,
            originalUrl: "https://example.com",
            ownerId: null,
            active: true,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            clickCount: 0,
        });

        await redisService.incr(cacheKeys.clicks(shortCode));
        await redisService.incr(cacheKeys.clicks(shortCode));
        await redisService.incr(cacheKeys.clicks(shortCode));

        await db
            .delete(urls)
            .where(eq(urls.shortCode, shortCode));

        await flushPendingClicks();

        const result = await pool.query(
            `SELECT * FROM urls WHERE short_code = $1`,
            [shortCode],
        );

        expect(result.rows).toHaveLength(0);

        const redisCount = await redisService.getNumber(
            cacheKeys.clicks(shortCode),
        );

        expect(redisCount).toBeNull();
    });
});