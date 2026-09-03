import { z } from "zod";
import { getI18nKey, phoneSchema } from "./shared";

const userNameSchema = z
  .string({
    error: getI18nKey("validators.auth.name.required"),
  })
  .trim()
  .min(2, {
    error: getI18nKey("validators.auth.name.min_length"),
  });

const userEmailSchema = z.email({
  error: getI18nKey("validators.auth.email.invalid"),
});

const passwordSchema = z
  .string({
    error: getI18nKey("validators.auth.password.required"),
  })
  .min(6, {
    error: getI18nKey("validators.auth.password.min_length"),
  });

export const signUpValidator = z.object({
  name: userNameSchema,
  email: userEmailSchema,
  password: passwordSchema,
  phone: phoneSchema,
});

export const updateUserInfoValidator = z.object({
  name: userNameSchema.optional(),
  phone: phoneSchema.optional(),
});

export const setActiveOrganizationValidator = z.object({
  organizationId: z.uuid({
    error: getI18nKey("validators.shared.uuid.invalid"),
  }),
});
