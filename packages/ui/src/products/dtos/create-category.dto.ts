import { z } from "zod";

export const createCategoryDto = z.object({
  name: z
    .string({
      error: "El nombre de lacategoría no puede estar vacía",
    })
    .min(1, {
      message: "El nombre de la categoría no puede estar vacía",
    }),
  description: z
    .string({
      error: "La descripción de la categoría debe tener una descripción",
    })
    .optional()
    .nullable(),
  parentId: z
    .uuid({
      error: "La categoría debe tener un ID padre",
    })
    .optional()
    .nullable(),
});

export type CreateCategoryDto = z.infer<typeof createCategoryDto>;
