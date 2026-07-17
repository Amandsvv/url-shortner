import { ApiError } from "../../utils/ApiError.js";
import { findRedirectDataByShortCode } from "./redirect.repository.js";

export async function resolveRedirectUrl(shortCode: string){
    const redirectData = await findRedirectDataByShortCode(shortCode);
    
    if(redirectData === null){
        throw new ApiError(404, "Short Url not found")
    }

    if(redirectData.expiresAt){
        const currTime = Date.now();
        if(+redirectData.expiresAt <= currTime){
            throw new ApiError(410, "Short Url got expired");
        }
    }

    return redirectData.originalUrl;
}