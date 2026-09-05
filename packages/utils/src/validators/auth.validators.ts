import { z } from "zod";
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  phoneSchema,
  uuidSchema,
} from "./shared";

export const signInValidator = z.object({
  email: nameSchema,
  password: passwordSchema,
});

export const signUpValidator = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
});

export const updateUserInfoValidator = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
});

export const setActiveOrganizationValidator = z.object({
  organizationId: uuidSchema,
});
