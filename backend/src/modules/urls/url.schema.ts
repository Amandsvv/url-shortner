import { z } from "zod";

export const createUrlSchema = z.object({
    originalUrl : z.url("A valid url is required").max(2048, "URL Must not exceed 2048 characters.").refine(
      (url) => {
        const protocol = new URL(url).protocol;

        return protocol === "http:" || protocol === "https:";
      },
      {
        message: "Only HTTP and HTTPS URLs are allowed",
      },
    )
});

export type createUrlInput = z.infer<typeof createUrlSchema>;