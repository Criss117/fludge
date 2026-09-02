import { z } from "zod";

const userNameSchema = z
  .string({
    error: "El nombre es requerido",
  })
  .trim()
  .min(2, {
    error: "Ingresa un nombre válido",
  });

const userEmailSchema = z.email({
  error: "Ingresa un email válido",
});

const userPhoneSchema = z
  .string({
    error: "El teléfono es requerido",
  })
  .trim()
  .min(10, {
    error: "Ingresa un número de teléfono válido",
  });

const passwordSchema = z
  .string({
    error: "La contraseña es requerida",
  })
  .min(6, {
    error: "La contraseña debe tener al menos 6 caracteres",
  });

export const signUpValidator = z.object({
  name: userNameSchema,

  email: userEmailSchema,

  password: passwordSchema,

  phone: userPhoneSchema,
});

export const updateUserInfoValidator = z.object({
  name: userNameSchema.optional(),

  phone: userPhoneSchema.optional(),
});

export const setActiveOrganizationValidator = z.object({
  organizationId: z.uuid({
    error: "La organización no es válida",
  }),
});
