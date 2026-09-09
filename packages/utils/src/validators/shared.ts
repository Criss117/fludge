import { z } from "zod";

import { statusEnum } from "../enums/db-enums";
import type { TranslationKey } from "@fludge/i18n/index";

export function getI18nKey(key: TranslationKey) {
  return key;
}

export const uuidSchema = z.uuid({
  error: getI18nKey("validators.uuid.invalid"),
});

export const nameSchema = z
  .string({
    error: getI18nKey("validators.name.required"),
  })
  .trim()
  .min(5, {
    error: getI18nKey("validators.name.min_length"),
  })
  .max(50, {
    error: getI18nKey("validators.name.max_length"),
  });

export const descriptionSchema = z.literal("").or(
  z
    .string({
      error: getI18nKey("validators.description.invalid"),
    })
    .trim()
    .min(15, {
      error: getI18nKey("validators.description.min_length"),
    })
    .max(100, {
      error: getI18nKey("validators.description.max_length"),
    }),
);

export const statusSchema = z.enum(statusEnum, {
  error: getI18nKey("validators.status.invalid"),
});

export const phoneSchema = z
  .string({
    error: getI18nKey("validators.phone.invalid"),
  })
  .trim()
  .min(9, {
    error: getI18nKey("validators.phone.min_length"),
  })
  .max(15, {
    error: getI18nKey("validators.phone.max_length"),
  })
  .refine(
    (v) => {
      const n = Number(v);

      if (isNaN(n)) return false;

      return n.toString().length === v.length;
    },
    {
      error: getI18nKey("validators.phone.invalid"),
    },
  );

export const emailSchema = z.email({
  error: getI18nKey("validators.email.invalid"),
});

export const passwordSchema = z
  .string({
    error: getI18nKey("validators.password.invalid"),
  })
  .trim()
  .min(8, {
    error: getI18nKey("validators.password.min_length"),
  })
  .max(50, {
    error: getI18nKey("validators.password.max_length"),
  });

export const notesSchema = z.literal("").or(
  z
    .string({
      error: getI18nKey("validators.notes.invalid"),
    })
    .trim()
    .min(15, {
      error: getI18nKey("validators.notes.min_length"),
    })
    .max(100, {
      error: getI18nKey("validators.notes.max_length"),
    }),
);
