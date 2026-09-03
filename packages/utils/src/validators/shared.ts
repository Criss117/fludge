import { z } from "zod";

import { statusEnum } from "../enums/db-enums";
import type { TranslationKey } from "@fludge/i18n/index";

export function getI18nKey(key: TranslationKey) {
  return key;
}

export function uuidSchema(
  message = getI18nKey("validators.shared.uuid.invalid"),
) {
  return z.uuid({
    error: message,
  });
}

export const nameSchema = z
  .string({
    error: getI18nKey("validators.shared.name.required"),
  })
  .trim()
  .min(1, {
    error: getI18nKey("validators.shared.name.min_length"),
  });

export const descriptionSchema = z
  .string({
    error: getI18nKey("validators.shared.description.invalid"),
  })
  .trim();

export const statusSchema = z.enum(statusEnum);

export const phoneSchema = z
  .string({
    error: getI18nKey("validators.shared.phone.invalid"),
  })
  .trim()
  .min(9, {
    error: getI18nKey("validators.shared.phone.min_length"),
  })
  .max(15, {
    error: getI18nKey("validators.shared.phone.max_length"),
  });

export const emailSchema = z.email({
  error: "Ingresa un email válido",
});
