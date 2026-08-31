import { createGoogleOAuthState } from "../../utils/oauth-state.js";
import { googleOAuthClient } from "../../config/google.js";
import { cacheKeys } from "../../infrastructure/redis/cache-keys.js";
import { redisService } from "../../infrastructure/redis/redis.services.js";
import { logger } from "../../config/logger.js";
import { ApiError } from "../../utils/ApiError.js";
import { googleConfig } from "../../config/google-env.js";
import { createSession, deleteSessionByRefreshTokenHash, findCurrentUser, findOrCreateGoogleUser, findSessionByHashRefreshToken, updateRefreshToken } from "./auth.repository.js";
import { createAccessToken, generateRefreshToken, hashRefreshToken } from "../../utils/jwt.js";

export async function startGoogleOAuth() {
    const state = await createGoogleOAuthState();
    const authorizationUrl =
        googleOAuthClient.generateAuthUrl({
            access_type: "offline",
            scope: ["openid", "email", "profile"],
            state,
        });

    return authorizationUrl;
}

export async function callbackGoogleOAuth(code: string, state: string) {
    const cacheKey = cacheKeys.oauthState(state);
    const data = await redisService.get<boolean>(cacheKey);

    if (data === null) {
        logger.debug("OAuth state validation failed", { cacheKey });
        throw new ApiError(400, "Authentication Failed");
    }

    await redisService.del(cacheKey);

    const { tokens } = await googleOAuthClient.getToken(code);

    let details;

    if (tokens.id_token) {
        logger.info("Google ID token verified");

        const idToken = tokens.id_token;

        details = await googleOAuthClient.verifyIdToken({ idToken, audience: googleConfig.GOOGLE_CLIENT_ID });
    } else {
        logger.error("Tokens missing")
        throw new ApiError(400, "Authentication Failed")
    }

    const payload = details.getPayload();

    if (
        !payload?.sub ||
        !payload.email ||
        !payload.name ||
        !payload.picture
    ) {
        throw new ApiError(400, "Invalid Google account data");
    }

    const googlePayload = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
    }

    const user = await findOrCreateGoogleUser(googlePayload);
    const accessToken = await createAccessToken(user.id);
    logger.info("Access token generated", { userId: user.id });

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
    );

    await createSession(user.id, refreshTokenHash, expiresAt);
    
    return { user, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken : string){
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const session = await findSessionByHashRefreshToken(refreshTokenHash);

    if(!session)
        throw new ApiError(401, "Authentication Failed")

    if(session.expiresAt <= new Date()){
        throw new ApiError(401, "Session already expired")
    }

    const userId = session.userId;
    const accessToken = await createAccessToken(userId);

    const newRefreshToken = generateRefreshToken();
    const newHashRefreshToken = hashRefreshToken(newRefreshToken);

    await updateRefreshToken(session.id, newHashRefreshToken);

    return { accessToken, newRefreshToken }
}

export async function currentUser(userId : string){
    const user = await findCurrentUser(userId);

    if(!user){
        throw new ApiError(400, "User Not Found");
    }

    return user;
}

export async function logout(refreshToken : string){
    const refreshTokenHash = hashRefreshToken(refreshToken);
    await deleteSessionByRefreshTokenHash(refreshTokenHash);
}