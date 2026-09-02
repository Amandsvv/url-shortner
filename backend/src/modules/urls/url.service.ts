import { v7 as uuidv7 } from "uuid";

import {
  DEFAULT_SHORT_CODE_LENGTH,
  MAX_SHORT_CODE_GENERATION_ATTEMPTS,
  TEMPORARY_SHORT_CODE_LENGTH_INCREMENT,
} from "../../constants/short-code.constants.js";
import { GUEST_URL_EXPIRY_DAYS } from "../../constants/url-constants.js";
import { generateShortCode } from "../../utils/short-code.js";
import { countActiveUrlsByUser, createUrlAtomically } from "./url.repository.js";
import { ShortCodeCollisionError } from "./url.repository.errors.js";
import { ApiError } from "../../utils/ApiError.js";
import { getPlanPolicy } from "../../config/plan-policy.js";
import { findUserPlan } from "./url.repository.js";

type CreateShortUrlInput = {
  originalUrl: string;
};

type GenerateShortUrlInput = {
  originalUrl: string;
  ownerId: string | null;
  expiresAt: Date;
};

async function generateAndCreateShortUrl(input: GenerateShortUrlInput) {
  const id = uuidv7();

  const lengths = [
    DEFAULT_SHORT_CODE_LENGTH,
    DEFAULT_SHORT_CODE_LENGTH + TEMPORARY_SHORT_CODE_LENGTH_INCREMENT,
  ];

  for (const length of lengths) {
    for (
      let attempt = 0;
      attempt < MAX_SHORT_CODE_GENERATION_ATTEMPTS;
      attempt++
    ) {
      try {
        const shortCode = generateShortCode(length);

        return await createUrlAtomically({
          id,
          shortCode,
          originalUrl: input.originalUrl,
          ownerId: input.ownerId,
          expiresAt: input.expiresAt,
        });
      } catch (error) {
        if (error instanceof ShortCodeCollisionError) {
          continue;
        }

        throw error;
      }
    }
  }

  throw new Error("Unable to generate a unique short code");
}
export async function createShortUrl(input: CreateShortUrlInput) {
  const expiresAt = new Date(
    Date.now() + GUEST_URL_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  return generateAndCreateShortUrl({
    originalUrl: input.originalUrl,
    ownerId: null,
    expiresAt,
  });
}

export async function createShortUrlByUser(userId: string, input: CreateShortUrlInput,) {
  const user = await findUserPlan(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const policy = getPlanPolicy(user.plan);

  const activeUrlCount = await countActiveUrlsByUser(userId);

  if (activeUrlCount >= policy.activeUrlLimit) {
    throw new ApiError(403, `Active URL limit reached for ${user.plan} plan.`);
  }

  const expiresAt = new Date(
    Date.now() +
    GUEST_URL_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  return generateAndCreateShortUrl({
    originalUrl: input.originalUrl,
    ownerId: userId,
    expiresAt,
  });
}