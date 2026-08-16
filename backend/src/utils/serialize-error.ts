type SerializedError = {
    type: string;
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
    detail?: string;
    constraint?: string;
    table?: string;
    column?: string;
    hint?: string;
    value?: string;
};

export function serializeError(
    error: unknown,
): SerializedError {
    if (error instanceof Error) {
        const pgError = error as Error & {
            code?: string;
            detail?: string;
            constraint?: string;
            table?: string;
            column?: string;
            hint?: string;
        };

        return {
            type: "Error",
            name: error.name,
            message: error.message,
            ...(error.stack !== undefined ? { stack: error.stack } : {}),
            ...(pgError.code !== undefined ? { code: pgError.code } : {}),
            ...(pgError.detail !== undefined ? { detail: pgError.detail } : {}),
            ...(pgError.constraint !== undefined
                ? { constraint: pgError.constraint }
                : {}),
            ...(pgError.table !== undefined ? { table: pgError.table } : {}),
            ...(pgError.column !== undefined ? { column: pgError.column } : {}),
            ...(pgError.hint !== undefined ? { hint: pgError.hint } : {}),
        };
    }

    const type = typeof error;

    if (error === null || type !== "object" && type != "function") {
        return {
            type: "unknown",
            value: String(error)
        }
    }

    return {
        type: "unknown",
        value: "[Non-Error thrown value]"
    }
}