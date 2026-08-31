import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

export const sessions = pgTable("sessions", {
    id : uuid("id").primaryKey(),

    userId : uuid("user_id").notNull().references(() => users.id, {
        onDelete : "cascade",
    }),

    refreshTokenHash : text("refresh_token_hash").notNull().unique(),

    expiresAt : timestamp("expires_at", {
        withTimezone : true
    }).notNull(),

    createdAt : timestamp("created_at", {
        withTimezone : true,
    }).notNull().defaultNow(),

    updatedAt : timestamp("updated_at", {
        withTimezone : true
    }).notNull().defaultNow(),
});