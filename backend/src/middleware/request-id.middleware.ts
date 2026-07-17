import { v7 as uuid7 } from "uuid";
import type { RequestHandler } from "express";
import {
    runWithRequestContext,
} from "../context/request-context.js";

export const requestIdMiddleware: RequestHandler = (
    req,
    res,
    next,
) => {
    const requestId = uuid7();
    res.setHeader("X-Request-ID", requestId);
    req.requestId = requestId;
    runWithRequestContext(
        {
            requestId,
        }, () => {
            next();
        }
    )
};

