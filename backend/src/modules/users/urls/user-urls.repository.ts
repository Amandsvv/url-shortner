import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { urls } from "../../../db/schema/urls.schema.js";
import { updateUrl } from "./user-urls.schema.js";

export async function countUserUrls(userId: string) {
    const [result] = await db
        .select({
            count: count(),
        })
        .from(urls)
        .where(eq(urls.ownerId, userId));

    return result?.count ?? 0;
}

export async function findUserUrls(
    userId: string,
    limit: number,
    offset: number,
) {
    return db
        .select({
            id: urls.id,
            shortCode: urls.shortCode,
            originalUrl: urls.originalUrl,
            active: urls.active,
            expiresAt: urls.expiresAt,
            createdAt: urls.createdAt,
            updatedAt: urls.updatedAt,
        })
        .from(urls)
        .where(eq(urls.ownerId, userId))
        .orderBy(desc(urls.createdAt))
        .limit(limit)
        .offset(offset);
}

export async function findUserUrlsById(userId: string, urlId : string){
        const result = await db
        .select({
            shortCode: urls.shortCode,
            originalUrl: urls.originalUrl,
            active: urls.active,
            expiresAt: urls.expiresAt,
            createdAt: urls.createdAt,
            updatedAt: urls.updatedAt,
        })
        .from(urls)
        .where(
            and(
                eq(urls.ownerId, userId),
                eq(urls.id, urlId)
            )
        ).limit(1)

        return result[0];
}

export async function updateUserUrl(userId: string, urlId: string, changes: updateUrl) {
  const result = await db.update(urls)
    .set({...(changes.originalUrl !== undefined ? { originalUrl: changes.originalUrl } : {}),
      ...(changes.active !== undefined ? { active: changes.active } : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(urls.id, urlId),
        eq(urls.ownerId, userId)
      )
    )
    .returning({
      id: urls.id,
      shortCode: urls.shortCode,
      originalUrl: urls.originalUrl,
      active: urls.active,
      expiresAt: urls.expiresAt,
      updatedAt: urls.updatedAt,
    });

  return result[0];
}

export async function deleteUserUrl(userId: string, urlId: string){
    const deletedUrlId = await db.delete(urls).where(
        and(
            eq(urls.ownerId, userId),
            eq(urls.id ,urlId)
        )
    ).returning({deletedId : urls.id,  shortCode: urls.shortCode})

    return deletedUrlId[0];
}