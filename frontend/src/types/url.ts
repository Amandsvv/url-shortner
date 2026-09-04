export type Url = {
    id: string;
    shortCode: string;
    originalUrl: string;
    active: boolean;
    clickCount: number;
    expiresAt: string;
    createdAt: string;
};

export type UrlItem = {
    id: string;
    shortCode: string;
    originalUrl: string;
    active: boolean;
    clickCount: number;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
};

export type UserUrlsResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        items: UrlItem[];
        page: number;
        limit: number;
        totalPages: number;
        totalUrls: number;
    };
};

export type CreateUrlRequest = {
    originalUrl: string;
};

export type CreateUrlModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
};
export type UpdateUrlRequest = {
    originalUrl?: string;
    active?: boolean;
};