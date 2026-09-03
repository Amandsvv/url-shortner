import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { createTestUser } from "../helpers/auth.js";
import { generateRefreshToken, hashRefreshToken } from "../../src/utils/jwt.js";
import { createSession } from "../../src/modules/auth/auth.repository.js";

describe("Authentication", () => {
    it("rejects access to protected routes without a token", async () => {
        const response = await request(app)
            .get("/api/v1/user/urls");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it("rejects an invalid access token", async () => {
        const response = await request(app)
            .get("/api/v1/user/urls")
            .set("Authorization", "Bearer invalid-token");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it("allows an authenticated user to access protected routes", async () => {
        const { accessToken } = await createTestUser();

        const response = await request(app)
            .get("/api/v1/user/urls")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it("rotates the refresh token", async () => {
        const { user } = await createTestUser();

        const refreshToken = generateRefreshToken();
        const refreshTokenHash = hashRefreshToken(refreshToken);

        await createSession(
            user.id,
            refreshTokenHash,
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        );

        const response = await request(app)
            .post("/api/v1/auth/refresh")
            .set("Cookie", `refreshToken=${refreshToken}`);

        expect(response.status).toBe(200);
        expect(response.body.accessToken).toEqual(expect.any(String));

        const setCookie = response.headers["set-cookie"];
        expect(setCookie).toBeDefined();

        // Extract the new refresh token from Set-Cookie.
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        const newCookie = cookies.find(
            (cookie) => typeof cookie === "string" && cookie.startsWith("refreshToken="),
        );

        expect(newCookie).toBeDefined();

        const newRefreshToken = newCookie!
            .split(";")[0]
            .split("=")[1];

        expect(newRefreshToken).not.toBe(refreshToken);

        const oldTokenResponse = await request(app)
            .post("/api/v1/auth/refresh")
            .set("Cookie", `refreshToken=${refreshToken}`);

        expect(oldTokenResponse.status).toBe(401);

        const newTokenResponse = await request(app)
            .post("/api/v1/auth/refresh")
            .set("Cookie", `refreshToken=${newRefreshToken}`);

        expect(newTokenResponse.status).toBe(200);
        expect(newTokenResponse.body.accessToken).toEqual(
            expect.any(String),
        );
    });

    it("rejects an expired refresh token", async () => {
        const { user } = await createTestUser();

        const refreshToken = generateRefreshToken();
        const refreshTokenHash = hashRefreshToken(refreshToken);

        await createSession(
            user.id,
            refreshTokenHash,
            new Date(Date.now() - 60 * 1000),
        );

        const response = await request(app)
            .post("/api/v1/auth/refresh")
            .set("Cookie", `refreshToken=${refreshToken}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it("revokes the refresh token on logout", async () => {
        const { user, accessToken } = await createTestUser();

        const refreshToken = generateRefreshToken();
        const refreshTokenHash = hashRefreshToken(refreshToken);

        await createSession(
            user.id,
            refreshTokenHash,
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        );

        const logoutResponse = await request(app)
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`)
            .set("Cookie", `refreshToken=${refreshToken}`);

        expect(logoutResponse.status).toBe(200);

        const refreshResponse = await request(app)
            .post("/api/v1/auth/refresh")
            .set("Cookie", `refreshToken=${refreshToken}`);

        expect(refreshResponse.status).toBe(401);

        const setCookie = logoutResponse.headers["set-cookie"];
        const cookies = Array.isArray(setCookie)
            ? setCookie
            : [setCookie];

        expect(
            cookies.some(
                (cookie) =>
                    cookie.startsWith("refreshToken=;") &&
                    cookie.includes("Path=/api/v1/auth"),
            ),
        ).toBe(true);
    });
}); 