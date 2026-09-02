import { env } from "./src/config/env.js"
import { defineConfig } from "drizzle-kit";

const databaseUrl =
    process.env.NODE_ENV === "test"
        ? env.DATABASE_URL_TEST
        : env.DATABASE_URL;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});