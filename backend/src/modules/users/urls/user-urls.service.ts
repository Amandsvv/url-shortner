import { cacheKeys } from "../../../infrastructure/redis/cache-keys.js";
import { redisService } from "../../../infrastructure/redis/redis.services.js";
import { ApiError } from "../../../utils/ApiError.js";
import { countUserUrls, deleteUserUrl, findUserUrls, findUserUrlsById, updateUserUrl, UserStats } from "./user-urls.repository.js";
import type { updateUrl, UserUrlsQuery } from "./user-urls.schema.js";

export async function userUrls(userId : string, query : UserUrlsQuery){
    const totalUrls = await countUserUrls(userId);
    const totalPages = Math.ceil(totalUrls/ query.limit);

    const offset = (query.page - 1) * query.limit;

    const items = await findUserUrls(userId, query.limit, offset);

    return {items, totalUrls, totalPages };
}

export async function userUrlsById(userId: string, urlId : string){
    const data = await findUserUrlsById(userId, urlId);
    if(!data){
        throw new ApiError(404, "Short URL not found.")
    }
    return data;
}

export async function getUserStats(userId: string) {
    return await UserStats(userId);
}

export async function updateUserUrlById(userId : string, urlId: string, changes : updateUrl){
    const updatedUrl = await updateUserUrl(userId, urlId, changes);
    
    if(!updatedUrl){
        throw new ApiError(404, "Short URL not found.");
    }

    const key = cacheKeys.url(updatedUrl.shortCode);
    await redisService.del(key);

    return updatedUrl;
}

export async function deleteUserUrlById(userId : string, urlId: string){
    const deletedUrl = await deleteUserUrl(userId, urlId);
    
    if(!deletedUrl){
        throw new ApiError(404, "Short URL not found.");
    }

    await redisService.del(
        cacheKeys.url(deletedUrl.shortCode)
    );
}

