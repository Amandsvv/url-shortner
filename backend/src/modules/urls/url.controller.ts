import type { Request, Response } from "express";

import { createUrlSchema } from "./url.schema.js";
import { createShortUrl, createShortUrlByUser } from "./url.service.js";

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

export async function createUrlByUserController(
  req: Request,
  res: Response,
) {
  const input = createUrlSchema.parse(req.body);

  const userId = req.user.id;

  const createdUrl = await createShortUrlByUser(
    userId,
    input,
  );

  return res.status(201).json({
    success: true,
    status: 201,
    message: "Short URL created successfully",
    data: createdUrl,
  });
}