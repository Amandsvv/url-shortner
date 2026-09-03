import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(3000),

    NODE_ENV: z.enum([
        "development",
        "test",
        "production",
    ]).default("development"),

    DATABASE_URL: z.string().min(1).optional(),
    DATABASE_URL_TEST: z.string().min(1).optional(),

    REDIS_URL: z.string().min(1).optional(),
    REDIS_URL_TEST: z.string().min(1).optional(),

    LOG_LEVEL: z
        .enum(["error", "warn", "info", "debug"])
        .optional(),

    INSTANCE_ID: z
        .string()
        .min(1)
        .optional(),

    FRONTEND_URL: z.string().min(1),

    JWT_SECRET: z.string().min(10),

    JWT_ACCESS_EXPIRES_IN: z.string().min(1),

    TRUST_PROXY: z.coerce.number().int().nonnegative().default(0)
});

const parsedEnv = envSchema.parse(process.env);

if (parsedEnv.NODE_ENV === "test") {
    if (!parsedEnv.DATABASE_URL_TEST) {
        throw new Error("DATABASE_URL_TEST is required in test environment");
    }

    if (!parsedEnv.REDIS_URL_TEST) {
        throw new Error("REDIS_URL_TEST is required in test environment");
    }
} else {
    if (!parsedEnv.DATABASE_URL) {
        throw new Error("DATABASE_URL is required");
    }

    if (!parsedEnv.REDIS_URL) {
        throw new Error("REDIS_URL is required");
    }
}

export const env = parsedEnv;