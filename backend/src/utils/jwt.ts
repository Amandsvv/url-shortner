import { SignJWT } from "jose";
import { env } from "../config/env.js";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function createAccessToken(userId : string){
    return await new SignJWT({
        sub: userId
    }).setProtectedHeader({
        alg:"HS256",
        typ:"JWT"
    }).setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
    .sign(secret);
}