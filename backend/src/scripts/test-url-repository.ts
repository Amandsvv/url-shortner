import { v7 as uuidv7 } from "uuid";

import { pool } from "../db/index.js";
import isShortCodeCollision, { createUrlAtomically } from "../modules/urls/url.repository.js";
import { ShortCodeCollisionError } from "../modules/urls/url.repository.errors.js";

const TEST_SHORT_CODE = "testA1";

async function run() {
    try {
        const input1 = {
            id: uuidv7(),
            shortCode: TEST_SHORT_CODE,
            originalUrl: "https://example.com",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };

        const input2 = {
            id: uuidv7(),
            shortCode: TEST_SHORT_CODE,
            originalUrl: "https://example.com",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };

        const createdUrl = await createUrlAtomically(input1);
        console.log("First creation succeeded:", createdUrl);

        try {
            await createUrlAtomically(input2);

            throw new Error(
                "Test failed: second creation should have collided",
            );
        } catch (error) {
            if (isShortCodeCollision(error)) {
                throw new ShortCodeCollisionError();
            }

            throw error;
        }
    } catch (error) {
        console.error("Repository test failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

run();