import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z.url("A valid url is required").max(2048, "URL Must not exceed 2048 characters.")
  .refine(
    (value) => {
      try {
        const url = new URL(value);

        return (
          url.protocol === "http:" ||
          url.protocol === "https:"
        );
      } catch {
        return false;
      }
    },
    {
      message: "Invalid URL",
    },
  ),
});

export type createUrlInput = z.infer<typeof createUrlSchema>;