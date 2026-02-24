import { z } from "zod";

export const createProductSchema = z
  .object({
    sku: z
      .string("El código único del producto es requerido")
      .min(5, "El código único del producto debe tener al menos 5 caracteres")
      .max(
        100,
        "El código único del producto debe tener máximo 100 caracteres",
      ),

    name: z
      .string("El nombre del producto es requerido")
      .min(5, "El nombre del producto debe tener al menos 5 caracteres")
      .max(50, "El nombre del producto debe tener máximo 50 caracteres"),

    description: z
      .string()
      .max(100, "La descripción del producto debe tener máximo 100 caracteres"),

    wholesalePrice: z.coerce
      .number<number>("El precio de venta al por mayor es requerido")
      .positive("El precio de venta al por mayor debe ser mayor a 0"),

    salePrice: z.coerce
      .number<number>("El precio de venta al por menor es requerido")
      .positive("El precio de venta al por menor debe ser mayor a 0"),

    costPrice: z.coerce
      .number<number>("El precio de compra del producto es requerido")
      .positive("El precio de compra del producto debe ser mayor a 0"),

    stock: z.coerce
      .number<number>("El stock del producto es requerido")
      .positive("El stock del producto debe ser mayor a 0"),

    reorderLevel: z.coerce
      .number<number>("El nivel de reorden del producto es requerido")
      .min(0, "El nivel de reorden del producto debe ser mayor o igual a 0"),
  })
  .refine((data) => data.reorderLevel <= data.stock, {
    path: ["reorderLevel"],
    error: "El stock minimo no puede ser mayor al stock actual",
  })
  .refine((data) => data.wholesalePrice < data.salePrice, {
    path: ["wholesalePrice"],
    error: "El precio al por mayor debe ser menor al precio de venta",
  })
  .refine((data) => data.wholesalePrice > data.costPrice, {
    path: ["wholesalePrice"],
    error: "El precio al por mayor debe ser mayor al precio de compra",
  })
  .refine((data) => data.costPrice < data.salePrice, {
    path: ["costPrice"],
    error: "El precio de compra debe ser menor al precio de venta",
  })
  .refine((data) => data.costPrice < data.wholesalePrice, {
    path: ["costPrice"],
    error: "El precio de compra debe ser menor al precio al por mayor",
  })
  .refine((data) => data.salePrice > data.costPrice, {
    path: ["salePrice"],
    error: "El precio de venta debe ser menor al precio de compra",
  })
  .refine((data) => data.salePrice > data.wholesalePrice, {
    path: ["salePrice"],
    error: "El precio de venta debe ser menor al precio al por mayor",
  });

export type CreateProductSchema = z.infer<typeof createProductSchema>;
