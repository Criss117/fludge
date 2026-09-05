import { z } from "zod";
import { getI18nKey, nameSchema, phoneSchema, uuidSchema } from "./shared";

const legalNameSchema = z
  .string({
    error: getI18nKey("validators.legal_name.required"),
  })
  .trim()
  .min(3, {
    error: getI18nKey("validators.legal_name.min_length"),
  })
  .max(50, {
    error: getI18nKey("validators.legal_name.max_length"),
  });

const taxIdSchema = z
  .string({
    error: getI18nKey("validators.tax_id.required"),
  })
  .trim()
  .min(9, {
    error: getI18nKey("validators.tax_id.min_length"),
  })
  .max(15, {
    error: getI18nKey("validators.tax_id.max_length"),
  });

const addressSchema = z
  .string({
    error: getI18nKey("validators.address.required"),
  })
  .trim()
  .min(5, {
    error: getI18nKey("validators.address.min_length"),
  })
  .max(50, {
    error: getI18nKey("validators.address.max_length"),
  });

export const registerOrganizationValidator = z.object({
  name: nameSchema,
  phone: phoneSchema,
  legalName: legalNameSchema,
  taxId: taxIdSchema,
  address: addressSchema,
});

export const updateOrganizationValidator = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
});

export const addMemberValidator = z.object({
  userId: uuidSchema,
});
