import { z } from "zod";
import { statusEnum } from "../enums/db-enums";
import { descriptionSchema, nameSchema, uuidSchema } from "./shared";

export const createCategoryValidator = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const deleteCategoryValidator = z.object({
  id: uuidSchema("El id del grupo es requerido"),
});

export const updateCategoryValidator = z.object({
  id: z.uuid({
    error: "El id del grupo es requerido",
  }),
  name: nameSchema.optional(),
  description: descriptionSchema.optional(),
  status: z.enum(statusEnum).optional(),
});
