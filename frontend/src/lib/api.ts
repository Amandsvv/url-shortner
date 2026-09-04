const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TIMEOUT_MS = 15_000;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export class ApiClientError extends Error {
    statusCode: number;
    details: unknown;

    constructor(
        statusCode: number,
        message: string,
        details: unknown = null,
    ) {
        super(message);
        this.name = "ApiClientError";
        this.statusCode = statusCode;
        this.details = details;
    }
}

type ApiErrorResponse = {
    message?: string;
    details?: unknown;
};

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    const controller = new AbortController();
    const timeoutId = setTimeout(
        () => controller.abort(),
        API_TIMEOUT_MS,
    );
    const abortRequest = () => controller.abort();

    if (options.signal) {
        if (options.signal.aborted) {
            controller.abort();
        } else {
            options.signal.addEventListener(
                "abort",
                abortRequest,
                { once: true },
            );
        }
    }

    headers.set("Content-Type", "application/json");

    try {
        const response = await fetch(
            `${API_URL}${path}`,
            {
                ...options,
                headers,
                credentials: "include",
                signal: controller.signal,
            },
        );

        let data: unknown = null;

        const contentType = response.headers.get(
            "content-type",
        );

        if (contentType?.includes("application/json")) {
            data = await response.json();
        }

        if (!response.ok) {
            const errorData = data as ApiErrorResponse | null;

            throw new ApiClientError(
                response.status,
                errorData?.message ?? "Request failed",
                errorData?.details ?? null,
            );
        }

        return data as T;
    } finally {
        clearTimeout(timeoutId);
        options.signal?.removeEventListener(
            "abort",
            abortRequest,
        );
    }
}