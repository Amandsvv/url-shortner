declare global {
    namespace Express {
        interface Request {
            // your property
            requestId : string;
        }
    }
}

export {};