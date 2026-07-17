import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { pool } from "./db/index.js"
import { serializeError } from "./utils/serialize-error.js";

type ShutDownSignal = 'SIGINT' | "SIGTERM";

async function startup() {
    await pool.query("SELECT 1");
    const server = app.listen(env.PORT, () => {
        logger.info("Application started", {
            port: env.PORT,
        });
    })
    return server;
}

startup().then((server) => {
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

            await pool.end();
            clearTimeout(forceShutdownTimer);
            logger.info("PostgreSQL pool closed");
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
