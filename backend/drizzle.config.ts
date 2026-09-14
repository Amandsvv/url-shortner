import { defineConfig } from "drizzle-kit";

const databaseUrl =
    process.env.NODE_ENV === "test"
        ? process.env.DATABASE_URL_TEST
        : process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("Database URL is required for migrations");
}

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema/*.ts",
    out: "./drizzle",
    dbCredentials: {
        url: databaseUrl,
    },
});
