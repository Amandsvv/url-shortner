import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { pool } from "./db/index.js"
import { serializeError } from "./utils/serialize-error.js";
import { redis } from "./config/redis.js";
import { startAnalyticsWorker } from "./modules/analytics/analytics.worker.js";

type ShutDownSignal = 'SIGINT' | "SIGTERM";

async function startup() {
    await pool.query("SELECT 1");

    let stopAnalyticsWorker: (() => Promise<void>) | undefined;
    
    try {
        await redis.connect();
        await redis.ping();

        stopAnalyticsWorker = startAnalyticsWorker();
    } catch (error) {
        logger.warn("Redis unavailable. Running without cache.", {
            error: serializeError(error),
        });
    }

    const server = app.listen(env.PORT, () => {
        logger.info("Application started", {
            port: env.PORT,
        });
    });

    return {
        server,
        stopAnalyticsWorker,
    };
}

startup().then(({ server, stopAnalyticsWorker }) => {
    let isShuttingDown = false;
    async function shutdown(signal: ShutDownSignal) {
        if (isShuttingDown) {
            return;
        }
        isShuttingDown = true;
        logger.info("Shutdown started.", { signal })
        const shutdownTimeoutMs = 10_000;

        const forceShutdownTimer = setTimeout(() => {
            logger.error("Graceful shutdown timed out", {
                signal,
                timeoutMs: shutdownTimeoutMs,
            });

            process.exit(1);
        }, shutdownTimeoutMs);
        try {
            await new Promise<void>((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
            logger.info("HTTP server closed");

            await stopAnalyticsWorker?.();

            await pool.end();
            clearTimeout(forceShutdownTimer);
            logger.info("PostgreSQL pool closed");

            if (redis.isOpen) {
                await redis.quit();
                logger.info("Redis connection closed");
            }

            logger.info("Shutdown completed", {
                signal,
            });
        } catch (error) {
            clearTimeout(forceShutdownTimer);
            logger.error("Graceful shutdown failed", {
                signal,
                error: serializeError(error),
            });

            process.exit(1);
        }

    }
    const shutdownSignals: ShutDownSignal[] = [
        "SIGINT",
        "SIGTERM",
    ];
    for (const signal of shutdownSignals) {
        process.on(signal, () => {
            void shutdown(signal);
        });
    }
}).catch((err) => {
    logger.error("Application startup failed", {
        error: serializeError(err),
    }); process.exit(1);
})
