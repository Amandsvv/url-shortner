import { beforeAll, afterAll, beforeEach } from "vitest";
import { pool } from "../../src/db/index.js";
import { redis } from "../../src/config/redis.js";

beforeAll(async () => {
    if (!redis.isOpen) {
        await redis.connect();
    }

    await redis.ping();
});

beforeEach(async () => {
    await pool.query(`
        TRUNCATE TABLE
            click_flush_items,
            click_flush_batches,
            urls,
            sessions,
            users,
            reserved_short_codes
        CASCADE
    `);

    await redis.flushDb();
});

afterAll(async () => {
    if (redis.isOpen) {
        await redis.quit();
    }

    await pool.end();
});