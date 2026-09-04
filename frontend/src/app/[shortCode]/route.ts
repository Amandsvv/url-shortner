import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
    process.env.BACKEND_API_URL;

if (!BACKEND_API_URL) {
    throw new Error(
        "BACKEND_API_URL is not configured",
    );
}

export async function GET(
    request: NextRequest,
    context: {
        params: Promise<{
            shortCode: string;
        }>;
    },
) {
    const { shortCode } = await context.params;

    const backendResponse = await fetch(
        `${BACKEND_API_URL}/${encodeURIComponent(shortCode)}`,
        {
            method: "GET",
            redirect: "manual",
            cache: "no-store",
        },
    );

    if (
        backendResponse.status >= 300 &&
        backendResponse.status < 400
    ) {
        const location =
            backendResponse.headers.get("location");

        if (!location) {
            return new NextResponse(
                "Redirect location missing",
                {
                    status: 502,
                },
            );
        }

        return NextResponse.redirect(
            location,
            302,
        );
    }

    if (backendResponse.status === 404) {
        return NextResponse.redirect(
            new URL(
                "/link-not-found",
                request.url,
            ),
            302,
        );
    }

    if (backendResponse.status === 410) {
        return NextResponse.redirect(
            new URL(
                "/link-expired",
                request.url,
            ),
            302,
        );
    }

    return new NextResponse(
        "Unable to resolve short URL",
        {
            status: 502,
        },
    );
}