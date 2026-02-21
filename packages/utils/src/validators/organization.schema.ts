import { z } from "zod";
import { emailValidator, phoneValidator } from "./utils";

export const createOrganizationSchema = z.object({
  name: z
    .string("El nombre es obligatorio")
    .min(5, "El nombre debe tener al menos 5 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  legalName: z
    .string("El nombre legal es obligatorio")
    .min(2, "El nombre legal debe tener al menos 2 caracteres")
    .max(200, "El nombre legal no puede exceder 200 caracteres"),
  address: z
    .string("La dirección es obligatoria")
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(500, "La dirección no puede exceder 500 caracteres"),
  contactEmail: emailValidator,
  contactPhone: phoneValidator,
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;
