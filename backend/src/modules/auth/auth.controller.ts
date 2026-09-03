import { callbackGoogleOAuth, currentUser, logout, refreshAccessToken, startGoogleOAuth } from "./auth.service.js";
import { CookieOptions, Request, Response } from "express";
import { ApiError } from "../../utils/ApiError.js";
import { env } from "../../config/env.js"
import { ApiSuccessResponse } from "../../utils/ApiSuccessResponse.js";

const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/api/v1/auth",
};

export const googleController = async (req: Request, res: Response) => {
    const url = await startGoogleOAuth();
    return res.redirect(url);
}

export const googleCallbackController = async (req: Request, res: Response) => {
    const { state, code } = req.query;

    if (typeof state !== "string" || typeof code !== "string") {
        throw new ApiError(400, "Invalid OAuth callback");
    }

    const { user, accessToken, refreshToken } = await callbackGoogleOAuth(code, state);



    return res
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .status(200).json({
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
            },
            message: "Authentication Successful",
        });
}

export const refreshTokensController = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (typeof refreshToken !== "string") {
        throw new ApiError(401, "Authentication Failed");
    }

    const { accessToken, newRefreshToken } = await refreshAccessToken(refreshToken);

    return res
        .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
        .status(200)
        .json({
            accessToken
        })
}

export const getCurrentUserController = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const user = await currentUser(userId);

    return res.status(200).json(new ApiSuccessResponse(200, "User Found", { user }));
}

export const logoutController = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (typeof refreshToken === "string") {
        await logout(refreshToken);
    }

    return res
        .clearCookie("refreshToken", refreshCookieOptions)
        .status(200)
        .json({ message: "User logged out successfully" })
}