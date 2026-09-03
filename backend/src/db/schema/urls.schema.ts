import {
    boolean,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
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

        clickCount: integer("click_count").notNull().default(0),

        expiresAt: timestamp("expires_at", {
            withTimezone: true,
        }).notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).notNull().defaultNow(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        }).notNull().defaultNow(),
    },
    (table) => ({
        ownerCreatedAtIdx: index("urls_owner_created_at_idx").on(
            table.ownerId,
            table.createdAt,
        ),

        ownerActiveExpiresIdx: index(
            "urls_owner_active_expires_idx",
        ).on(
            table.ownerId,
            table.active,
            table.expiresAt,
        ),
    }),
);