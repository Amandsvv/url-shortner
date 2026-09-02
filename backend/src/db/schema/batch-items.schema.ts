import {
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    unique,
} from "drizzle-orm/pg-core";

import { clickFlushBatches } from "./click-flush-batches.schema.js";

export const clickFlushItems = pgTable(
    "click_flush_items",
    {
        id: uuid("id").primaryKey(),

        batchId: uuid("batch_id")
            .notNull()
            .references(() => clickFlushBatches.id, {
                onDelete: "cascade",
            }),

        shortCode: text("short_code").notNull(),

        clickCount: integer("click_count").notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).notNull().defaultNow(),
    },
    (table) => ({
        batchShortCodeUnique: unique(
            "click_flush_items_batch_id_short_code_unique"
        ).on(table.batchId, table.shortCode),
    }),
);