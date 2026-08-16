import { randomUUID } from "node:crypto";
import { db } from "../../db/index.js"
import { users } from "../../db/schema/users.schema.js"

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

    return user[0];
}