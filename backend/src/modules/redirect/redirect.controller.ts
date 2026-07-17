import type { RequestHandler } from "express";
import { resolveRedirectUrl } from "./redirect.service.js";

type RedirectParams = {
    shortCode: string;
};

export const redirectController:RequestHandler<RedirectParams>= async(req, res) => {
    const { shortCode } = req.params;
    const originalUrl = await resolveRedirectUrl(shortCode);
    return res.redirect(302, originalUrl);
}