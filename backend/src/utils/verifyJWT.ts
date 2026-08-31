import { jwtVerify } from "jose";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const secret = new TextEncoder().encode(
    env.JWT_SECRET,
);

export async function verifyJWT(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        throw new ApiError(401, "Authentication Required");
    }

    const accessToken = authorization.substring(7);

    try {
        const { payload } = await jwtVerify(
            accessToken,
            secret,
        );

        if (typeof payload.sub !== "string") {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = {
            id: payload.sub,
        };

        next();
    } catch {
        throw new ApiError(401, "Invalid Access Token");
    }
}