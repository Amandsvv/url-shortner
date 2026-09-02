import {
    pgTable,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const clickFlushBatches = pgTable("click_flush_batches", {
    id: uuid("id").primaryKey(),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).notNull().defaultNow(),

    processedAt: timestamp("processed_at", {
        withTimezone: true,
    }),
});