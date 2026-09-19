import { z } from "zod";
import {
  getI18nKey,
  nameSchema,
  phoneSchema,
  emailSchema,
  uuidSchema,
  statusSchema,
} from "./shared";
import { customerDocumentTypeEnum } from "../enums/db-enums";

export const documentTypeSchema = z.enum(customerDocumentTypeEnum, {
  error: getI18nKey("validators.document_type.invalid"),
});

export const documentNumberSchema = z
  .string({
    error: getI18nKey("validators.document_number.invalid"),
  })
  .trim()
  .min(5, {
    error: getI18nKey("validators.document_number.min_length"),
  })
  .max(30, {
    error: getI18nKey("validators.document_number.max_length"),
  });

export const creditLimitSchema = z
  .number({
    error: getI18nKey("validators.credit_limit.invalid"),
  })
  .min(0, {
    error: getI18nKey("validators.credit_limit.non_negative"),
  });

export const createCustomerValidator = z
  .object({
    name: nameSchema,
    phone: phoneSchema
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : v)),
    email: emailSchema
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : v)),
    creditLimit: creditLimitSchema,
    documentType: documentTypeSchema
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : v)),
    documentNumber: documentNumberSchema
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : v)),
  })
  .refine((data) => data.phone !== null || data.email !== null, {
    error: getI18nKey("validators.contact.required"),
    path: ["phone"],
  })
  .refine(
    (data) => {
      const hasDocType = data.documentType !== null;
      const hasDocNumber = data.documentNumber !== null;
      return (hasDocType && hasDocNumber) || (!hasDocType && !hasDocNumber);
    },
    {
      error: getI18nKey("validators.document.pair_required"),
      path: ["documentType"],
    },
  );

export const updateCustomerValidator = z
  .object({
    id: uuidSchema,
    name: nameSchema.optional(),
    phone: phoneSchema
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : v))
      .optional(),
    email: emailSchema
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : v))
      .optional(),
    creditLimit: creditLimitSchema.optional(),
    documentType: documentTypeSchema
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : v))
      .optional(),
    documentNumber: documentNumberSchema
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : v))
      .optional(),
    status: statusSchema.optional(),
  })
  .refine(
    (data) => {
      if (
        data.documentType === undefined ||
        data.documentNumber === undefined
      ) {
        return true;
      }
      const hasDocType = data.documentType !== null;
      const hasDocNumber = data.documentNumber !== null;
      return (hasDocType && hasDocNumber) || (!hasDocType && !hasDocNumber);
    },
    {
      error: getI18nKey("validators.document.pair_required"),
      path: ["documentType"],
    },
  );
