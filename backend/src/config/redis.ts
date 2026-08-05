import { createClient } from "redis";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { serializeError } from "../utils/serialize-error.js";

export let redisAvailable = false;

export const redis = createClient({
    url : env.REDIS_URL
});

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