import { randomUUID } from "node:crypto";
import { cacheKeys } from "../../infrastructure/redis/cache-keys.js";
import { redisService } from "../../infrastructure/redis/redis.services.js";
import { ClickFlushItem, flushClickBatch } from "./analytics.repository.js";
import { logger } from "../../config/logger.js";
import { serializeError } from "../../utils/serialize-error.js";

const MAX_CLICK_KEYS_PER_FLUSH = 500;
const CLICK_KEY_PATTERN = "url:clicks:*";

export async function flushPendingClicks() {
    let cursor = "0";
    let handedOffKeys = 0;
    const batchId = randomUUID();
    const items: ClickFlushItem[] = [];
    const processingKeys: string[] = [];

    do {
        const result = await redisService.scan(
            cursor,
            CLICK_KEY_PATTERN,
            100,
        );

        if (!result) {
            return;
        }

        cursor = result.cursor;

        for (const key of result.keys) {
            if (handedOffKeys >= MAX_CLICK_KEYS_PER_FLUSH) {
                break;
            }

            const prefix = "url:clicks:";
            const shortCode = key.slice(prefix.length);

            const processingKey = cacheKeys.clicksProcessing(
                batchId,
                shortCode,
            );

            const count = await redisService.handoffClickCounter(
                cacheKeys.clicks(shortCode),
                processingKey,
            );

            if (count === null || count <= 0) {
                continue;
            }

            items.push({
                shortCode,
                clickCount: count
            });

            processingKeys.push(processingKey);

            handedOffKeys++;
        }

        if (handedOffKeys >= MAX_CLICK_KEYS_PER_FLUSH) {
            break;
        }

    } while (cursor !== "0");

    if (items.length === 0) {
        return;
    }

    const result = await flushClickBatch(batchId, items);

    if (result.status === "processed" ||
        result.status === "already_processed") {
        for (const key of processingKeys) {
            await redisService.del(key);
        }
    }

    logger.info("Click batch flushed:", {
        batchId,
        itemCount: items.length,
    });
}
export function startAnalyticsWorker() {
    const intervalMs = 30_000;

    let isFlushing = false;
    let stopped = false;
    let currentRun: Promise<void> | null = null;

    const run = async () => {
        if (stopped || isFlushing) {
            return;
        }

        isFlushing = true;

        currentRun = (async () => {
            try {
                await flushPendingClicks();
            } catch (error) {
                logger.error("Analytics worker flush failed", {
                    error: serializeError(error),
                });
            } finally {
                isFlushing = false;
                currentRun = null;
            }
        })();

        await currentRun;
    };

    void run();

    const interval = setInterval(() => {
        void run();
    }, intervalMs);

    return async () => {
        stopped = true;
        clearInterval(interval);

        if (currentRun) {
            await currentRun;
        }

        logger.info("Analytics worker stopped");
    };
}