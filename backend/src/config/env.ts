import "dotenv/config"; // loads values from .env into: process.env
import { z } from 'zod';
// envSchema : defines what valid configuration looks like.
const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    LOG_LEVEL: z
        .enum(["error", "warn", "info", "debug"])
        .optional(),

    INSTANCE_ID: z
        .string()
        .min(1)
        .optional(),
    FRONTEND_URL : z.string().min(1)
})

export const env = envSchema.parse(process.env);