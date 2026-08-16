import { randomInt } from "node:crypto";
import { cacheKeys } from "../infrastructure/redis/cache-keys.js";
import { redisService } from "../infrastructure/redis/redis.services.js";

function generateState(): string {
    let result = "";

    const STATE_CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let i = 0; i < 32; i++) {
        const idx = randomInt(STATE_CODE_ALPHABET.length);
        result+=STATE_CODE_ALPHABET[idx];
    }

    return result;
}

export async function createGoogleOAuthState(){
    const state = generateState();
    const oauthKey = cacheKeys.oauthState(state);
    await redisService.set(oauthKey, true, 300); //Your redisService.set() currently swallows Redis errors and returns void.
    return state;
}