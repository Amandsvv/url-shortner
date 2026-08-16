import { randomUUID } from "node:crypto";
import { db } from "../../db/index.js"
import { users } from "../../db/schema/users.schema.js"
import { ApiError } from "../../utils/ApiError.js";

type GooglePayload = {
    sub : string,
    email : string,
    name : string,
    picture: string
}
export async function findOrCreateGoogleUser(payload : GooglePayload){
    const providerId = payload.sub;
    const name = payload.name;
    const email = payload.email;
    const avatarUrl = payload.picture;

    const user = await db.insert(users).values({
        id: randomUUID(),
        provider:"GOOGLE",
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