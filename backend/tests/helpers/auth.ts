import { randomUUID } from "node:crypto";
import { db } from "../../src/db/index.js";
import { users } from "../../src/db/schema/users.schema.js";
import { createAccessToken } from "../../src/utils/jwt.js";

export async function createTestUser() {
    const [user] = await db
        .insert(users)
        .values({
            id: randomUUID(),
            email: `${randomUUID()}@example.com`,
            name: "Test User",
            provider: "GOOGLE",
            providerId: `test-${randomUUID()}`,
        })
        .returning();

    if (!user) {
        throw new Error("Failed to create test user");
    }

    const accessToken = await createAccessToken(user.id);

    return {
        user,
        accessToken,
    };
}