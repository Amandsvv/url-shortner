import { randomUUID } from "node:crypto";
import { db } from "../../db/index.js"
import { users } from "../../db/schema/users.schema.js"
import { ApiError } from "../../utils/ApiError.js";
import { sessions } from "../../db/schema/sessions.schema.js";
import { eq } from "drizzle-orm";

type GooglePayload = {
    sub: string,
    email: string,
    name: string,
    picture: string
}

export async function findOrCreateGoogleUser(payload: GooglePayload) {
    const providerId = payload.sub;
    const name = payload.name;
    const email = payload.email;
    const avatarUrl = payload.picture;

    const user = await db.insert(users).values({
        id: randomUUID(),
        provider: "GOOGLE",
        providerId,
        name,
        email,
        avatarUrl
    }).onConflictDoUpdate({
        target: users.providerId,
        set: {
            email,
            name,
            avatarUrl,
            updatedAt: new Date(),
        },
    }).returning();

    if (!user[0]) {
        throw new ApiError(500, "Failed to create or retrieve user");
    }
    return user[0];
}

export async function createSession(userId: string, refreshTokenHash: string, expiresAt: Date) {
    const session = await db.insert(sessions).values({
        id: randomUUID(),
        userId,
        refreshTokenHash,
        expiresAt
    }).returning();

    if(!session[0]){
        throw new ApiError( 500, "Session creation failed")
    }

    return session[0];
}

export async function findSessionByHashRefreshToken(hashRefreshToken : string){
    const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.refreshTokenHash, hashRefreshToken))
        .limit(1);

    return session[0];
}

export async function updateRefreshToken(sessionId : string, refreshTokenHash : string){  
    const [updatedSession] = await db.update(sessions)
    .set({ refreshTokenHash })
    .where(eq(sessions.id, sessionId))
    .returning();

    if(!updatedSession){
        throw new ApiError(401, "Session not found or could not be udated");
    }

    return updatedSession;
}

export async function findCurrentUser(userId : string){
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return result[0];
}

export async function deleteSessionByRefreshTokenHash(refreshTokenHash: string){
    await db.delete(sessions).where(eq(sessions.refreshTokenHash, refreshTokenHash))
}