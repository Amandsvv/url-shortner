import { google } from "googleapis";
import { googleConfig } from "./google-env.js";

export const googleOAuthClient = new google.auth.OAuth2(
    googleConfig.GOOGLE_CLIENT_ID,
    googleConfig.GOOGLE_CLIENT_SECRET,
    googleConfig.GOOGLE_CALLBACK_URL,
);