import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import request from "supertest";

import app from "../../src/app.js";
import { redisService } from "../../src/infrastructure/redis/redis.services.js";
import { cacheKeys } from "../../src/infrastructure/redis/cache-keys.js";

describe("Guest URL API", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

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
        expect(createResponse.status).toBe(201);

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

    it("still redirects when Redis operations fail", async () => {
        const createResponse = await request(app)
            .post("/api/v1/urls")
            .send({
                originalUrl: "https://example.com/redis-failure",
            });

        expect(createResponse.status).toBe(201);

        const { shortCode } = createResponse.body.data;

        const getSpy = vi
            .spyOn(redisService, "get")
            .mockResolvedValue(null);

        const setSpy = vi
            .spyOn(redisService, "set")
            .mockResolvedValue(undefined);

        const incrSpy = vi
            .spyOn(redisService, "incr")
            .mockResolvedValue(null);

        const response = await request(app)
            .get(`/${shortCode}`)
            .redirects(0);

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe(
            "https://example.com/redis-failure",
        );

        expect(getSpy).toHaveBeenCalled();
        expect(setSpy).toHaveBeenCalled();
        expect(incrSpy).toHaveBeenCalled();
    });

    it("allows guest URL creation when Redis rate limiting fails", async () => {
        const consumeSpy = vi
            .spyOn(redisService, "consumeRateLimit")
            .mockResolvedValue(null);

        const response = await request(app)
            .post("/api/v1/urls")
            .send({
                originalUrl: "https://example.com/rate-limit-failure",
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);

        expect(consumeSpy).toHaveBeenCalled();
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

    it("rejects a JSON payload larger than the configured limit", async () => {
        const response = await request(app)
            .post("/api/v1/urls")
            .send({
                originalUrl: `https://example.com/${"a".repeat(20_000)}`,
            });

        expect(response.status).toBe(413);
    });

    it("returns a consistent error response for an unknown short URL", async () => {
        const response = await request(app)
            .get("/does-not-exist");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            statusCode: 404,
            message: "Short Url not found",
            details: null,
        });
    });
});