import { db } from "../../db/index.js"
import { urls } from "../../db/schema/urls.schema.js"
import { eq } from "drizzle-orm";

export async function findRedirectDataByShortCode(shortCode: string) {
    const result = await db.select({ originalUrl: urls.originalUrl, expiresAt: urls.expiresAt }).from(urls).where(eq(urls.shortCode, shortCode)).limit(1);

    return result[0] ?? null;
}