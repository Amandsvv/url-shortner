import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";
import { serializeError } from "../utils/serialize-error.js";

const hasErrorType = (
    error: unknown,
): error is { type: string } => {
    return (
        typeof error === "object" &&
        error !== null &&
        "type" in error &&
        typeof error.type === "string"
    );
};

export const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {

    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Validation failed",
            details: error.flatten(),
        });
    }

    if (
        error instanceof SyntaxError &&
        hasErrorType(error) &&
        error.type === "entity.parse.failed"
    ) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Malformed JSON body",
            details: null,
        });
    }

    if (hasErrorType(error) &&
        error.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            statusCode: 413,
            message: "Request body is too large",
            details: null,
        });
    }

    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
            success: false,
            statusCode: error.statusCode,
            message: error.message,
            details: error.details ?? null,
        });
    }

    logger.error("Unhandled request error", {
        requestId: req.requestId,
        error: serializeError(error),
        method: req.method,
        path: req.originalUrl,
    });

    logger.error("Unhandled request error", {
        requestId: req.requestId,
        error: serializeError(error),
        method: req.method,
        path: req.originalUrl,
    });

    return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal server error",
        details: null,
    });
};