import type { Request, Response } from "express";

import { createUrlSchema } from "./url.schema.js";
import { createShortUrl } from "./url.service.js";

export async function createUrlController(
  req: Request,
  res: Response,
) {
  const input = createUrlSchema.parse(req.body);

  const createdUrl = await createShortUrl(input);

  return res.status(201).json({
    success: true,
    status: 201,
    message: "Short URL created successfully",
    data: createdUrl,
  });
}