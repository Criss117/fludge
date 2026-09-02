import { z } from "zod";
import { uuidSchema } from "./shared";

const organizationNameSchema = z
  .string({
    error: "El nombre es requerido",
  })
  .trim()
  .min(3, {
    error: "El nombre es muy corto",
  })
  .max(50, {
    error: "El nombre es muy largo",
  });

const organizationPhoneSchema = z
  .string({
    error: "El teléfono es requerido",
  })
  .trim()
  .min(9, {
    error: "El teléfono es muy corto",
  })
  .max(15, {
    error: "El teléfono es muy largo",
  });

const legalNameSchema = z
  .string({
    error: "La razón social es requerida",
  })
  .trim()
  .min(3, {
    error: "La razón social es muy corta",
  })
  .max(50, {
    error: "La razón social es muy larga",
  });

const taxIdSchema = z
  .string({
    error: "El NIT es requerido",
  })
  .trim()
  .min(9, {
    error: "El NIT es muy corto",
  })
  .max(15, {
    error: "El NIT es muy largo",
  });

const addressSchema = z
  .string({
    error: "La dirección es requerida",
  })
  .trim()
  .min(5, {
    error: "La dirección es muy corta",
  })
  .max(50, {
    error: "La dirección es muy larga",
  });

export const registerOrganizationValidator = z.object({
  name: organizationNameSchema,
  phone: organizationPhoneSchema,
  legalName: legalNameSchema,
  taxId: taxIdSchema,
  address: addressSchema,
});

export const updateOrganizationValidator = z.object({
  name: organizationNameSchema.optional(),
  phone: organizationPhoneSchema.optional(),
  address: addressSchema.optional(),
});

export const addMemberValidator = z.object({
  userId: uuidSchema("El id del usuario es requerido"),
});
