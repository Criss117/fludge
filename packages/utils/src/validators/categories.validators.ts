import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string("El nombre es requerido")
    .min(5, "El nombre debe tener al menos 5 caracteres"),
  description: z.string("La descripción no es valida").nullable(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.uuid("El id es requerido"),
});

export const deleteCategoriesSchema = z.object({
  ids: z
    .array(z.uuid("El id es requerido"))
    .min(1, "Se requiere al menos un id"),
});

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
export type DeleteCategoriesSchema = z.infer<typeof deleteCategoriesSchema>;
export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
