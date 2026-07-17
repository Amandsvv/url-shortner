import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const reservedShortCodes = pgTable(
    "reserved_short_codes",
    {
        shortCode : text("short_code").primaryKey(),
        reservedAt : timestamp("reserved_at", {
            withTimezone : true,
        }).notNull().defaultNow()
    }
)