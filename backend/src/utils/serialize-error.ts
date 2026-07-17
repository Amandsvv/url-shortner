type SerializedError = {
    type: string;
    name?: string;
    message?: string;
    stack?: string;
    value?: string;
};

export function serializeError(
    error: unknown,
): SerializedError {
    if (error instanceof Error) {
        return {
            type : "Error",
            name : error.name,
            message : error.message,
            ...(error.stack != undefined ? {stack : error.stack } : {}),
        }
    }

    const type = typeof error;

    if (error === null || type !== "object" && type != "function") {
        return {
            type: "unknown",
            value : String(error)
        }
    }

    return {
        type: "unknown",
        value : "[Non-Error thrown value]"
    }
}