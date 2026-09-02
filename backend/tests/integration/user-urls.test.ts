import { describe, expect, it } from "vitest";
import request from "supertest";

import app from "../../src/app.js";
import { createTestUser } from "../helpers/auth.js";
import { randomUUID } from "node:crypto";
import { db } from "../../src/db/index.js";
import { urls } from "../../src/db/schema/urls.schema.js";
import { redisService } from "../../src/infrastructure/redis/redis.services.js";
import { cacheKeys } from "../../src/infrastructure/redis/cache-keys.js";

describe("User URL authorization", () => {
    it("does not allow one user to access another user's URL", async () => {
        const userA = await createTestUser();
        const userB = await createTestUser();

        const createResponse = await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${userA.accessToken}`)
            .send({
                originalUrl: "https://example.com",
            });

        expect(createResponse.status).toBe(201);

        const urlId = createResponse.body.data.id;

        const response = await request(app)
            .get(`/api/v1/user/urls/${urlId}`)
            .set("Authorization", `Bearer ${userB.accessToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    it("does not allow one user to update another user's URL", async () => {
        const userA = await createTestUser();
        const userB = await createTestUser();

        const createResponse = await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${userA.accessToken}`)
            .send({
                originalUrl: "https://example.com",
            });

        expect(createResponse.status).toBe(201);

        const urlId = createResponse.body.data.id;

        const response = await request(app)
            .patch(`/api/v1/user/urls/${urlId}`)
            .set("Authorization", `Bearer ${userB.accessToken}`)
            .send({
                originalUrl: "https://example.org",
            });

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    it("does not allow one user to delete another user's URL", async () => {
        const userA = await createTestUser();
        const userB = await createTestUser();

        const createResponse = await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${userA.accessToken}`)
            .send({
                originalUrl: "https://example.com",
            });

        expect(createResponse.status).toBe(201);

        const urlId = createResponse.body.data.id;

        const response = await request(app)
            .delete(`/api/v1/user/urls/${urlId}`)
            .set("Authorization", `Bearer ${userB.accessToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    it("allows a user to access their own URL", async () => {
        const { accessToken } = await createTestUser();

        const createResponse = await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                originalUrl: "https://example.com",
            });

        expect(createResponse.status).toBe(201);

        const urlId = createResponse.body.data.id;

        const response = await request(app)
            .get(`/api/v1/user/urls/${urlId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.originalUrl).toBe("https://example.com");
    });

    it("allows a user to update their own URL", async () => {
        const { accessToken } = await createTestUser();

        const createResponse = await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                originalUrl: "https://example.com",
            });

        expect(createResponse.status).toBe(201);

        const { id, shortCode } = createResponse.body.data;

        // Warm the redirect cache.
        const firstRedirect = await request(app)
            .get(`/${shortCode}`)
            .redirects(0);

        expect(firstRedirect.status).toBe(302);
        expect(firstRedirect.headers.location).toBe(
            "https://example.com",
        );

        const updateResponse = await request(app)
            .patch(`/api/v1/user/urls/${id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                originalUrl: "https://example.org",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.success).toBe(true);
        expect(updateResponse.body.data.originalUrl).toBe(
            "https://example.org",
        );

        // This must use the updated DB value, proving cache invalidation worked.
        const secondRedirect = await request(app)
            .get(`/${shortCode}`)
            .redirects(0);

        expect(secondRedirect.status).toBe(302);
        expect(secondRedirect.headers.location).toBe(
            "https://example.org",
        );
    });

    it("returns only the authenticated user's URLs", async () => {
        const userA = await createTestUser();
        const userB = await createTestUser();

        await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${userA.accessToken}`)
            .send({ originalUrl: "https://example.com/a" });

        await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${userA.accessToken}`)
            .send({ originalUrl: "https://example.com/b" });

        await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${userB.accessToken}`)
            .send({ originalUrl: "https://example.com/other" });

        const response = await request(app)
            .get("/api/v1/user/urls")
            .set("Authorization", `Bearer ${userA.accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toHaveLength(2);
        expect(response.body.data.totalUrls).toBe(2);
        expect(response.body.data.items).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    originalUrl: "https://example.com/other",
                }),
            ]),
        );
    });

    it("paginates the user's URLs correctly", async () => {
        const { accessToken } = await createTestUser();

        await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ originalUrl: "https://example.com/1" });

        await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ originalUrl: "https://example.com/2" });

        await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ originalUrl: "https://example.com/3" });

        const pageOne = await request(app)
            .get("/api/v1/user/urls?page=1&limit=2")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(pageOne.status).toBe(200);
        expect(pageOne.body.success).toBe(true);
        expect(pageOne.body.data.items).toHaveLength(2);
        expect(pageOne.body.data.page).toBe(1);
        expect(pageOne.body.data.limit).toBe(2);
        expect(pageOne.body.data.totalUrls).toBe(3);
        expect(pageOne.body.data.totalPages).toBe(2);

        const pageTwo = await request(app)
            .get("/api/v1/user/urls?page=2&limit=2")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(pageTwo.status).toBe(200);
        expect(pageTwo.body.success).toBe(true);
        expect(pageTwo.body.data.items).toHaveLength(1);
        expect(pageTwo.body.data.page).toBe(2);
        expect(pageTwo.body.data.limit).toBe(2);
        expect(pageTwo.body.data.totalUrls).toBe(3);
        expect(pageTwo.body.data.totalPages).toBe(2);
    });

    it("enforces the active URL quota", async () => {
        const { accessToken } = await createTestUser();

        for (let i = 0; i < 30; i++) {
            const response = await request(app)
                .post("/api/v1/urls/user")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    originalUrl: `https://example.com/${i}`,
                });

            expect(response.status).toBe(201);
        }

        const response = await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                originalUrl: "https://example.com/31",
            });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });

    it("allows creating a URL after disabling an active URL", async () => {
        const { accessToken } = await createTestUser();

        const createdUrlIds: string[] = [];

        for (let i = 0; i < 30; i++) {
            const response = await request(app)
                .post("/api/v1/urls/user")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    originalUrl: `https://example.com/${i}`,
                });

            expect(response.status).toBe(201);

            createdUrlIds.push(response.body.data.id);
        }

        const disableResponse = await request(app)
            .patch(`/api/v1/user/urls/${createdUrlIds[0]}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                active: false,
            });

        expect(disableResponse.status).toBe(200);
        expect(disableResponse.body.success).toBe(true);
        expect(disableResponse.body.data.active).toBe(false);

        const newUrlResponse = await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                originalUrl: "https://example.com/new",
            });

        expect(newUrlResponse.status).toBe(201);
        expect(newUrlResponse.body.data.originalUrl).toBe(
            "https://example.com/new",
        );
    });

    it("does not count an expired URL toward the active URL quota", async () => {
        const { user, accessToken } = await createTestUser();

        await db.insert(urls).values({
            id: randomUUID(),
            shortCode: `expired-${randomUUID()}`,
            originalUrl: "https://example.com/expired",
            ownerId: user.id,
            active: true,
            expiresAt: new Date(Date.now() - 60 * 1000),
        });

        for (let i = 0; i < 29; i++) {
            const response = await request(app)
                .post("/api/v1/urls/user")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    originalUrl: `https://example.com/${i}`,
                });

            expect(response.status).toBe(201);
        }

        const response = await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                originalUrl: "https://example.com/new",
            });

        expect(response.status).toBe(201);
    });

    it("permanently deletes the user's URL", async () => {
        const { accessToken } = await createTestUser();

        const createResponse = await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                originalUrl: "https://example.com/delete-me",
            });

        expect(createResponse.status).toBe(201);

        const { id, shortCode } = createResponse.body.data;

        const beforeDelete = await request(app)
            .get(`/${shortCode}`)
            .redirects(0);

        expect(beforeDelete.status).toBe(302);
        expect(beforeDelete.headers.location).toBe(
            "https://example.com/delete-me",
        );

        const deleteResponse = await request(app)
            .delete(`/api/v1/user/urls/${id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.success).toBe(true);

        const afterDelete = await request(app)
            .get(`/${shortCode}`)
            .redirects(0);

        expect(afterDelete.status).toBe(404);
    });

    it("can disable and re-enable its own URL", async () => {
        const { accessToken } = await createTestUser();

        const createResponse = await request(app)
            .post("/api/v1/urls/user")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                originalUrl: "https://example.com/lifecycle",
            });

        expect(createResponse.status).toBe(201);

        const { id, shortCode } = createResponse.body.data;

        // Verify the URL initially redirects.
        const activeRedirect = await request(app)
            .get(`/${shortCode}`)
            .redirects(0);

        expect(activeRedirect.status).toBe(302);
        expect(activeRedirect.headers.location).toBe(
            "https://example.com/lifecycle",
        );

        // Disable the URL.
        const disableResponse = await request(app)
            .patch(`/api/v1/user/urls/${id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                active: false,
            });

        expect(disableResponse.status).toBe(200);
        expect(disableResponse.body.success).toBe(true);
        expect(disableResponse.body.data.active).toBe(false);

        // Disabled URL must no longer redirect.
        const disabledRedirect = await request(app)
            .get(`/${shortCode}`)
            .redirects(0);

        expect(disabledRedirect.status).toBe(404);

        // Re-enable the URL.
        const enableResponse = await request(app)
            .patch(`/api/v1/user/urls/${id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                active: true,
            });

        expect(enableResponse.status).toBe(200);
        expect(enableResponse.body.success).toBe(true);
        expect(enableResponse.body.data.active).toBe(true);

        // Redirect should work again.
        const enabledRedirect = await request(app)
            .get(`/${shortCode}`)
            .redirects(0);

        expect(enabledRedirect.status).toBe(302);
        expect(enabledRedirect.headers.location).toBe(
            "https://example.com/lifecycle",
        );
    });

    it("does not redirect an expired URL or record a click", async () => {
    const shortCode = `expired-${randomUUID()}`;

    await db.insert(urls).values({
        id: randomUUID(),
        shortCode,
        originalUrl: "https://example.com/expired",
        ownerId: null,
        active: true,
        expiresAt: new Date(Date.now() - 60 * 1000),
    });

    const response = await request(app)
        .get(`/${shortCode}`)
        .redirects(0);

    expect(response.status).toBe(410);

    const clickCount = await redisService.getNumber(
        cacheKeys.clicks(shortCode),
    );

    expect(clickCount).toBeNull();
});
});