import { z } from "zod";

import { statusEnum } from "../enums/db-enums";

export function uuidSchema(message = "El id no es válido") {
  return z.uuid({
    error: message,
  });
}

export const nameSchema = z
  .string({
    error: "El nombre es requerido",
  })
  .trim()
  .min(1, {
    error: "El nombre no puede estar vacío",
  });

export const descriptionSchema = z
  .string({
    error: "La descripción debe ser un texto",
  })
  .trim();

export const statusSchema = z.enum(statusEnum);

export const phoneSchema = z
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

export const emailSchema = z.email({
  error: "Ingresa un email válido",
});
