"use client";

import {
    createContext,
    useContext,
    useEffect,
    useCallback,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { apiFetch, ApiClientError } from "@/lib/api";

type User = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    plan: "FREE" | "PRO";
};

type RefreshResponse = {
    accessToken: string;
};

type MeResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        user: User;
    };
};


type AuthFetchOptions = RequestInit & {
    retryOnUnauthorized?: boolean;
};

type AuthContextValue = {
    accessToken: string | null;
    user: User | null;
    loading: boolean;
    refreshAccessToken: () => Promise<string>;
    authFetch: <T>(
        path: string,
        options?: AuthFetchOptions,
    ) => Promise<T>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<
    AuthContextValue | undefined
>(undefined);

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [accessToken, setAccessToken] =
        useState<string | null>(null);

    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState(true);

    const initializationStarted = useRef(false);

    const refreshPromiseRef = useRef<Promise<string> | null>(null);

    const refreshAccessToken = useCallback(async (): Promise<string> => {
        if (refreshPromiseRef.current) {
            return refreshPromiseRef.current;
        }

        const refreshPromise = (async () => {
            try {
                const response =
                    await apiFetch<RefreshResponse>(
                        "/api/v1/auth/refresh",
                        {
                            method: "POST",
                        },
                    );

                setAccessToken(response.accessToken);

                return response.accessToken;
            } finally {
                refreshPromiseRef.current = null;
            }
        })();

        refreshPromiseRef.current = refreshPromise;

        return refreshPromise;
    }, []);

    const authFetch = useCallback(
        async <T,>(
            path: string,
            options: AuthFetchOptions = {},
        ): Promise<T> => {
            const {
                retryOnUnauthorized = true,
                ...requestOptions
            } = options;

            let token = accessToken;

            if (!token) {
                token = await refreshAccessToken();
            }

            const buildOptions = (
                tokenValue: string,
            ): RequestInit => {
                const headers = new Headers(
                    requestOptions.headers,
                );

                headers.set(
                    "Authorization",
                    `Bearer ${tokenValue}`,
                );

                return {
                    ...requestOptions,
                    headers,
                };
            };

            try {
                return await apiFetch<T>(
                    path,
                    buildOptions(token),
                );
            } catch (error) {
                if (
                    retryOnUnauthorized &&
                    error instanceof ApiClientError &&
                    error.statusCode === 401
                ) {
                    const newToken =
                        await refreshAccessToken();

                    return apiFetch<T>(
                        path,
                        buildOptions(newToken),
                    );
                }

                throw error;
            }
        },
        [accessToken, refreshAccessToken],
    );

    const initializeAuth = useCallback(async () => {
        try {
            const token = await refreshAccessToken();

            const me = await apiFetch<MeResponse>(
                "/api/v1/auth/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            setUser(me.data.user);
        } catch (error) {
            // A missing/expired refresh cookie means the user is signed out.
            if (
                !(error instanceof ApiClientError) ||
                error.statusCode !== 401
            ) {
                console.error("AUTH INITIALIZATION FAILED:", error);
            }

            setAccessToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [refreshAccessToken]);

    useEffect(() => {
        // Prevent duplicate refresh calls in React Strict Mode. Refresh-token
        // rotation makes concurrent initialization requests invalidate one
        // another.
        if (initializationStarted.current) {
            return;
        }

        initializationStarted.current = true;
        void initializeAuth();
    }, [initializeAuth]);

    const logout = useCallback(async () => {
        await authFetch("/api/v1/auth/logout", {
            method: "POST",
        });

        setAccessToken(null);
        setUser(null);
    }, [authFetch]);

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                user,
                loading,
                refreshAccessToken,
                authFetch,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider",
        );
    }

    return context;
}