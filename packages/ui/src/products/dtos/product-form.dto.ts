import { z } from "zod";

export const productFormDto = z.object({
  name: z
    .string({
      error: "El nombre es obligatorio",
    })
    .min(1, "El nombre debe tener al menos 1 carácter")
    .max(255, "El nombre no puede exceder los 255 caracteres")
    .trim(),
  barcode: z
    .string({
      error: "El código de barras es obligatorio",
    })
    .min(1, "El código de barras es obligatorio")
    .max(100, "El código de barras no puede exceder los 100 caracteres")
    .trim(),
  purchasePrice: z
    .number({
      error: "El precio de compra es obligatorio",
    })
    .positive("El precio de compra debe ser mayor a 0"),
  salePrice: z
    .number({
      error: "El precio de venta es obligatorio",
    })
    .positive("El precio de venta debe ser mayor a 0"),
  wholesalePrice: z
    .number({
      error: "El precio mayorista es obligatorio",
    })
    .positive("El precio mayorista debe ser mayor a 0"),
  offerPrice: z
    .number({
      error: "El precio de oferta es obligatorio",
    })
    .positive("El precio de oferta debe ser mayor a 0"),
  minStock: z
    .number({
      error: "El stock mínimo es obligatorio",
    })
    .min(0, "El stock mínimo no puede ser negativo"),
  stock: z
    .number({
      error: "El stock máximo es obligatorio",
    })
    .min(0, "El stock máximo no puede ser negativo"),
  description: z
    .string({
      error: "La descripción debe ser un texto válido",
    })
    .max(1000, "La descripción no puede exceder los 1000 caracteres")
    .trim()
    .nullable()
    .optional(),
  categoryId: z
    .uuid({
      error: "El ID de categoría debe ser un texto válido",
    })
    .nullable()
    .optional(),
  brandId: z
    .uuid({ error: "El ID de marca debe ser un UUID válido" })
    .nullable()
    .optional(),
  allowsNegativeInventory: z.boolean({
    error: "Permitir inventario negativo debe ser verdadero o falso",
  }),
  weight: z
    .number({
      error: "El peso debe ser un número válido",
    })
    .positive("El peso debe ser mayor a 0")
    .nullable()
    .optional(),
  imageUrl: z
    .url({
      error: "La URL de imagen debe ser un texto válido",
    })
    .max(500, "La URL de imagen no puede exceder los 500 caracteres")
    .nullable()
    .optional(),
});

export type ProductFormDto = z.infer<typeof productFormDto>;
