import type { RequestHandler, Request } from "express";
import { performance } from "node:perf_hooks";

import { logger } from "../config/logger.js";

function normalizeRoute(route: string): string {
    if (route.length > 1 && route.endsWith("/")) {
        return route.slice(0, -1);
    }

    return route;
}

function resolveRouteTemplate(req: Request): string {
    const route = req.route?.path
        ? `${req.baseUrl}${req.route.path}`
        : req.path;

    return normalizeRoute(route);
}

export const requestLoggerMiddleware: RequestHandler = (
    req,
    res,
    next,
) => {
    const startTime = performance.now();

    res.on("finish", () => {
        const durationMs = Number(
            (performance.now() - startTime).toFixed(2),
        );
        const route = resolveRouteTemplate(req);
        logger.info("Request completed", {
            method: req.method,
            route,
            statusCode: res.statusCode,
            durationMs,
        });
    });

    next();
};

