import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

export const urls = pgTable(
    "urls",
    {
        id: uuid("id").primaryKey(),

        shortCode: text("short_code").notNull().unique(),

        originalUrl: text("original_url").notNull(),

        ownerId: uuid("owner_id").references(() => users.id, {
            onDelete: "set null",
        }),

        active: boolean("active").notNull().default(true),

        expiresAt: timestamp("expires_at", {
            withTimezone: true
        }).notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).notNull().defaultNow(),

          updatedAt: timestamp("updated_at", {
            withTimezone: true,
        }).notNull().defaultNow(),
    }
)