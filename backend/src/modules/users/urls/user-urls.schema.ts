import { z } from "zod";

export const userUrlsQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(50)
        .default(20),
});

export type UserUrlsQuery = z.infer<
    typeof userUrlsQuerySchema
>;

export const updateUserUrlSchema = z.object({
    originalUrl: z
        .url("A valid URL is required")
        .max(2048, "URL must not exceed 2048 characters")
        .refine(
            (url) => {
                const protocol = new URL(url).protocol;
                return protocol === "http:" || protocol === "https:";
            },
            {
                message: "Only HTTP and HTTPS URLs are allowed",
            },
        )
        .optional(),

    active: z.boolean().optional(),
    
}).refine((data) => 
    data.originalUrl != undefined || data.active !== undefined,
    {
        message : "At least one field must be provided."
    }
)

export type updateUrl = z.infer<typeof updateUserUrlSchema>;