import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const urls = pgTable(
    "urls",
    {
        id : uuid("id").primaryKey(),

        shortCode : text("short_code").notNull().unique(),

        originalUrl : text("original_url").notNull(),

        expiresAt : timestamp("expires_at", {
            withTimezone : true
        }).notNull(),

        createdAt : timestamp("created_at", {
            withTimezone : true,
        }).notNull().defaultNow()
    }
)