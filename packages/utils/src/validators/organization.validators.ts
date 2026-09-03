import { z } from "zod";
import { getI18nKey, phoneSchema, uuidSchema } from "./shared";

const organizationNameSchema = z
  .string({
    error: getI18nKey("validators.organizations.name.required"),
  })
  .trim()
  .min(3, {
    error: getI18nKey("validators.organizations.name.min_length"),
  })
  .max(50, {
    error: getI18nKey("validators.organizations.name.max_length"),
  });

const legalNameSchema = z
  .string({
    error: getI18nKey("validators.organizations.legal_name.required"),
  })
  .trim()
  .min(3, {
    error: getI18nKey("validators.organizations.legal_name.min_length"),
  })
  .max(50, {
    error: getI18nKey("validators.organizations.legal_name.max_length"),
  });

const taxIdSchema = z
  .string({
    error: getI18nKey("validators.organizations.tax_id.required"),
  })
  .trim()
  .min(9, {
    error: getI18nKey("validators.organizations.tax_id.min_length"),
  })
  .max(15, {
    error: getI18nKey("validators.organizations.tax_id.max_length"),
  });

const addressSchema = z
  .string({
    error: getI18nKey("validators.organizations.address.required"),
  })
  .trim()
  .min(5, {
    error: getI18nKey("validators.organizations.address.min_length"),
  })
  .max(50, {
    error: getI18nKey("validators.organizations.address.max_length"),
  });

export const registerOrganizationValidator = z.object({
  name: organizationNameSchema,
  phone: phoneSchema,
  legalName: legalNameSchema,
  taxId: taxIdSchema,
  address: addressSchema,
});

export const updateOrganizationValidator = z.object({
  name: organizationNameSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
});

export const addMemberValidator = z.object({
  userId: uuidSchema(),
});
