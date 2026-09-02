import { z } from "zod";
import { statusEnum } from "../enums/db-enums";

export const createCategoryValidator = z.object({
  name: z.string({
    error: "El nombre es requerido",
  }),
  description: z
    .string({
      error: "La descripción es requerida",
    })
    .optional(),
});

export const deleteCategoryValidator = z.object({
  id: z.uuid({
    error: "El id del grupo es requerido",
  }),
});

export const updateCategoryValidator = createCategoryValidator
  .partial()
  .extend({
    id: z.uuid({
      error: "El id del grupo es requerido",
    }),
    status: z.enum(statusEnum).optional(),
  });
