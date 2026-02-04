import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string("El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  legalName: z
    .string("El nombre legal es obligatorio")
    .min(2, "El nombre legal debe tener al menos 2 caracteres")
    .max(200, "El nombre legal no puede exceder 200 caracteres"),
  address: z
    .string("La dirección es obligatoria")
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(500, "La dirección no puede exceder 500 caracteres"),
  contactEmail: z
    .email("El correo electrónico no es válido")
    .min(2, "El correo electrónico debe tener al menos 2 caracteres")
    .max(100, "El correo electrónico no puede exceder 100 caracteres")
    .optional(),
  contactPhone: z
    .string("El teléfono no es válido")
    .min(10, "El teléfono debe tener al menos 10 caracteres")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .optional(),
  logo: z.string().url("El logo debe ser una URL válida").optional(),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;
