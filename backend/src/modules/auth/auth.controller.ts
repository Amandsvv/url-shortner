import { callbackGoogleOAuth, startGoogleOAuth } from "./auth.service.js";
import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError.js";

export const googleController = async (req: Request, res: Response) => {
    const url = await startGoogleOAuth();
    return res.redirect(url);
}
export const googleCallbackController = async (req: Request, res: Response) => {
    const { state, code } = req.query;

    if (typeof state !== "string" || typeof code !== "string") {
        throw new ApiError(400, "Invalid OAuth callback");
    }
    await callbackGoogleOAuth(code, state);
    
    return res.status(200).json({
        message: "OAuth state validated",
    });
}