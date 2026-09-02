import { describe, expect, it } from "vitest";
import { CacheTTLSeconds } from "../../src/utils/redirectTTL.js";

describe("CacheTTLSeconds", () => {
    it("returns default 24-hour TTL when expiresAt is not provided", () => {
        expect(CacheTTLSeconds()).toBe(60 * 60 * 24);
    });
});