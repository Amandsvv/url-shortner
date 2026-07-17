import { randomInt } from "node:crypto";
export function generateShortCode(length: number): string {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error("Short code length must be a positive integer");
    }

    let result = "";

    const SHORT_CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let i = 0; i < length; i++) {
        const idx = randomInt(SHORT_CODE_ALPHABET.length);
        result+=SHORT_CODE_ALPHABET[idx];
    }

    return result;
}