import { db } from "../../db/index.js";
import { reservedShortCodes } from "../../db/schema/reserved-short-codes.schema.js";
import { urls } from "../../db/schema/urls.schema.js";
import { ShortCodeCollisionError } from "./url.repository.errors.js";
import { and, count, eq, gt } from "drizzle-orm";
import { users } from "../../db/schema/users.schema.js";

type CreateUrlInput = {
  id: string;
  shortCode: string;
  originalUrl: string;
  expiresAt: Date;
  ownerId: string | null;
};

export async function createUrlAtomically(input: CreateUrlInput) {
  
    try {
        return db.transaction(async (tx) => {
            await tx.insert(reservedShortCodes).values({
            shortCode: input.shortCode,
            });
        
            const [createdUrl] = await tx
            .insert(urls)
            .values({
                id: input.id,
                shortCode: input.shortCode,
                originalUrl: input.originalUrl,
                ownerId: input.ownerId,
                expiresAt: input.expiresAt,
            })
            .returning();
        
            if (!createdUrl) {
            throw new Error("URL creation failed");
            }

            return createdUrl;
        });
    } 
    catch (error) {
        if(error && typeof error === "object" && "code" in error && "constraint" in error)  {
            if(error.code === "23505" && error.constraint === "reserved_short_codes_pkey"){
                throw new ShortCodeCollisionError();
            }
        }
        throw error;
    }
}

export default function isShortCodeCollision(error: unknown): boolean {
  if (
    !error ||
    typeof error !== "object" ||
    !("cause" in error)
  ) {
    return false;
  }

  const cause = error.cause;

  if (!cause || typeof cause !== "object") {
    return false;
  }

  return (
    "code" in cause &&
    cause.code === "23505" &&
    "constraint" in cause &&
    cause.constraint === "reserved_short_codes_pkey"
  );
}

export async function countActiveUrlsByUser(userId: string) {
    const [result] = await db
        .select({
            count: count(),
        })
        .from(urls)
        .where(
            and(
                eq(urls.ownerId, userId),
                eq(urls.active, true),
                gt(urls.expiresAt, new Date()),
            ),
        );
        
    if(!result) return 0;
    return result.count;
}

export async function findUserPlan(userId: string) {
    const result = await db
        .select({
            plan: users.plan,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return result[0];
}