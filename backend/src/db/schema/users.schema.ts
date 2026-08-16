import {
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
    "USER",
    "SUPER_ADMIN",
]);

export const userPlanEnum = pgEnum("user_plan", [
    "FREE",
    "PRO",
]);

export const authProviderEnum = pgEnum("auth_provider", [
    "GOOGLE",
]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey(),

    email: text("email").notNull().unique(),

    name: text("name").notNull(),

    avatarUrl: text("avatar_url"),

    provider: authProviderEnum("provider").notNull(),

    providerId: text("provider_id").notNull().unique(),

    role: userRoleEnum("role")
        .notNull()
        .default("USER"),

    plan: userPlanEnum("plan")
        .notNull()
        .default("FREE"),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
});