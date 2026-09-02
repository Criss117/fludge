import { z } from "zod";

export const setActiveOrganizationValidator = z.object({
  organizationId: z.uuid({
    error: "La organización no es válida",
  }),
});

export const signUpValidator = z.object({
  name: z.string().min(2, { error: "Ingresa un nombre válido" }),
  email: z.email({ error: "Ingresa un email válido" }),
  password: z.string().min(6, {
    error: "La contraseña debe tener al menos 6 caracteres",
  }),
  phone: z.string().min(10, { error: "Ingresa un número de teléfono válido" }),
});

export const updateUserInfoValidator = signUpValidator
  .pick({
    name: true,
    phone: true,
  })
  .partial();
