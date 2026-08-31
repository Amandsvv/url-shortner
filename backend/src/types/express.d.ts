declare global {
    namespace Express {
        interface Request {
            // your property
            requestId : string;
            user: {
                id: string;
            };
        }
    }
}

export {};