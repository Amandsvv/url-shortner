import { createClient } from "redis";
import { readFileSync } from "node:fs";

import { env } from "./env.js";
import { logger } from "./logger.js";
import { serializeError } from "../utils/serialize-error.js";

export let redisAvailable = false;

const redisUrl =
    env.NODE_ENV === "test"
        ? env.REDIS_URL_TEST
        : env.REDIS_URL;


if (!redisUrl) {
    throw new Error("Redis URL is missing");
}

const redisClientOptions = env.NODE_ENV === "production" ? {
    url : redisUrl,
    password: env.REDIS_AUTH,
    socket : {
        tls: true,
        ca : [
            readFileSync(env.REDIS_TLS_CA_PATH!,
                    "utf8",
                ),
            ],
        },
    } : 
    {
        url : redisUrl,
    };

export const redis = createClient(redisClientOptions);

redis.on("connect", ()=> {
    logger.info("Redis Connected")
});

redis.on("ready" , () => {
    logger.info("Redis Ready")
    redisAvailable = true;
})

redis.on("reconnecting", () => {
    logger.warn("Redis reconnecting...");
});

redis.on("end", () => {
    logger.warn("Redis connection closed");
    redisAvailable = false;
});

redis.on("error", (error) => {
    logger.error("Redis error", {
        error : serializeError(error),
    });
});
