import { describe, expect, it } from "vitest";
import request from "supertest";

import app from "../../src/app.js";
import { redisService } from "../../src/infrastructure/redis/redis.services.js";
import { cacheKeys } from "../../src/infrastructure/redis/cache-keys.js";

describe("Guest URL API", () => {
    it("creates a short URL", async () => {
        const response = await request(app)
            .post("/api/v1/urls")
            .send({
                originalUrl: "https://example.com",
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.originalUrl).toBe(
            "https://example.com",
        );
        expect(response.body.data.shortCode).toEqual(
            expect.any(String),
        );
        expect(response.body.data.ownerId).toBeNull();
        expect(response.body.data.active).toBe(true);
    });

    it("rejects an invalid URL", async () => {
        const response = await request(app)
            .post("/api/v1/urls")
            .send({
                originalUrl: "not-a-url",
            });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it("redirects to the original URL", async () => {
        const createResponse = await request(app)
            .post("/api/v1/urls")
            .send({
                originalUrl: "https://example.com",
            });

        const shortCode = createResponse.body.data.shortCode;

        const redirectResponse = await request(app)
            .get(`/${shortCode}`)
            .redirects(0);

        const clickCount = await redisService.getNumber(
            cacheKeys.clicks(shortCode),
        );

        expect(clickCount).toBe(1);

        expect(redirectResponse.status).toBe(302);
        expect(redirectResponse.headers.location).toBe(
            "https://example.com",
        );
    });

    it("rate limits guest URL creation after 10 requests", async () => {
        for (let i = 0; i < 10; i++) {
            const response = await request(app)
                .post("/api/v1/urls")
                .send({
                    originalUrl: `https://example.com/${i}`,
                });

            expect(response.status).toBe(201);
        }

        const response = await request(app)
            .post("/api/v1/urls")
            .send({
                originalUrl: "https://example.com/11",
            });

        expect(response.status).toBe(429);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Too many URL creation requests. Please try again later.",
        );
        expect(response.headers["x-ratelimit-limit"]).toBe("10");
        expect(response.headers["x-ratelimit-remaining"]).toBe("0");
        expect(response.headers["retry-after"]).toBeDefined();
    });
});