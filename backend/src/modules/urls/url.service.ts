import { v7 as uuidv7 } from "uuid";

import {
  DEFAULT_SHORT_CODE_LENGTH,
  MAX_SHORT_CODE_GENERATION_ATTEMPTS,
  TEMPORARY_SHORT_CODE_LENGTH_INCREMENT,
} from "../../constants/short-code.constants.js";
import { GUEST_URL_EXPIRY_DAYS } from "../../constants/url-constants.js";
import { generateShortCode } from "../../utils/short-code.js";
import { createUrlAtomically } from "./url.repository.js";
import { ShortCodeCollisionError } from "./url.repository.errors.js";

type CreateShortUrlInput = {
  originalUrl: string;
};

export async function createShortUrl(input: CreateShortUrlInput) {
  const expiresAt = new Date(
    Date.now() + GUEST_URL_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  const id = uuidv7();

  const lengths = [
    DEFAULT_SHORT_CODE_LENGTH,
    DEFAULT_SHORT_CODE_LENGTH +
      TEMPORARY_SHORT_CODE_LENGTH_INCREMENT,
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
          expiresAt,
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