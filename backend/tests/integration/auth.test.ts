import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { createTestUser } from "../helpers/auth.js";

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
});