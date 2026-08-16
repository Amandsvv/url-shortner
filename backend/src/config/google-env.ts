import "dotenv/config";
import { z } from "zod";

const googleSchema = z.object({
    GOOGLE_CLIENT_ID : z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1) ,
    GOOGLE_CALLBACK_URL: z.string().url()
});

export const googleConfig = googleSchema.parse(process.env);