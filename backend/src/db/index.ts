import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import {env} from "../config/env.js";

const databaseUrl =
    env.NODE_ENV === "test"
        ? env.DATABASE_URL_TEST
        : env.DATABASE_URL;

export const pool = new Pool({
    connectionString : databaseUrl,
    max:10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis : 5_000
})

export const db = drizzle(pool); 