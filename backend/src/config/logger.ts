import winston from "winston";
import { env } from "./env.js"
import { hostname } from "node:os";
import { getRequestContext } from "../context/request-context.js";

function resolveLogLevel() {
    if (env.LOG_LEVEL) {
        return env.LOG_LEVEL;
    }

    switch (env.NODE_ENV) {
        case "development":
            return "debug";

        case "test":
            return "warn";

        case "production":
            return "info";
    }
}
const level = resolveLogLevel();
const requestContextFormat = winston.format((info) => {
    const context = getRequestContext();

    if (context) {
        info.requestId = context.requestId;
    }

    return info;
});

const logFormat =
    env.NODE_ENV === "development"
        ? winston.format.combine(
            winston.format.colorize(),
            requestContextFormat(),
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaString = Object.keys(meta).length ? `${JSON.stringify(meta)}` : '';
                return `[${timestamp}] ${level}: ${message}${metaString ? ` ${metaString}` : ""
                    }`;
            })
        )
        : winston.format.combine(
            requestContextFormat(),
            winston.format.timestamp(),
            winston.format.json(),
        );
const instanceId = env.INSTANCE_ID ?? hostname();

export const logger = winston.createLogger({
    level,
    format: logFormat,
    defaultMeta: {
        service: 'url-shortener-api',
        environment: env.NODE_ENV,
        instanceId
    },
    transports: [
        new winston.transports.Console(),
    ]
})