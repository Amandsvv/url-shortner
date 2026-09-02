import type { Request, Response } from "express";
import { updateUserUrlSchema, userUrlsQuerySchema } from "./user-urls.schema.js";
import { deleteUserUrlById, updateUserUrlById, userUrls, userUrlsById } from "./user-urls.service.js";
import { ApiSuccessResponse } from "../../../utils/ApiSuccessResponse.js";
import { ApiError } from "../../../utils/ApiError.js";

export async function getUserUrls(req: Request, res: Response) {
    const userId = req.user.id;
    const query = userUrlsQuerySchema.parse(req.query);
    const { items, totalPages, totalUrls } = await userUrls(userId, query);

    return res.status(200).json(
        new ApiSuccessResponse(
            200,
            "User urls fetched successfully",
            {
                items,
                page: query.page,
                limit: query.limit,
                totalPages,
                totalUrls,
            }
        )
    )
}

export async function getUserUrlsById(
    req: Request,
    res: Response,
) {
    const userId = req.user.id;
    const { id: urlId } = req.params;

    if (typeof urlId !== "string") {
        throw new ApiError(400, "Invalid URL id");
    }

    const data = await userUrlsById(userId, urlId);

    return res.status(200).json(
        new ApiSuccessResponse(
            200,
            "Short URL found.",
            data,
        ),
    );
}

export async function updateUserUrlController(
    req: Request,
    res: Response,
) {
    const userId = req.user.id;
    const { id: urlId } = req.params;

    if (typeof urlId !== "string") {
        throw new ApiError(400, "Invalid URL id");
    }

    const changes = updateUserUrlSchema.parse(req.body);

    const data = await updateUserUrlById(
        userId,
        urlId,
        changes,
    );

    return res.status(200).json(
        new ApiSuccessResponse(
            200,
            "URL updated successfully",
            data,
        ),
    );
}

export async function deleteUserUrlController(req: Request, res: Response) {
    const userId = req.user.id;
    const { id: urlId } = req.params;

    if (typeof urlId !== "string") {
        throw new ApiError(400, "Invalid URL id");
    }

    await deleteUserUrlById(userId, urlId);

    return res.status(200).json(
        new ApiSuccessResponse(
            200,
            "URL deleted successfully",
            null,
        ),
    );
}