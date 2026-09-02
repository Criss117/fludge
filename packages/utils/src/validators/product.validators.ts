import { z } from "zod";
import { productStatusEnum } from "../enums/db-enums";

export const createProductPresentationValidator = z.object({
  name: z.string(),
  barcode: z.string().optional(),
  conversionFactor: z.number().positive(),
  pricePurchase: z.number().optional(),
  priceSale: z.number(),
  priceWholesale: z.number().optional(),
});

export const createProductValidator = z.object({
  name: z.string(),
  categoryId: z.uuid().optional(),
  description: z.string().optional(),
  stock: z.number(),
  allowNegativeStock: z.boolean(),
  minStock: z.number(),
  presentations: z.array(createProductPresentationValidator).min(1),
});

export const deleteProductValidator = z.object({
  id: z.uuid({
    error: "El id del producto debe ser un UUID válido",
  }),
});

export const updateProductPresentationValidator =
  createProductPresentationValidator.partial().extend({
    id: z.uuid({
      error: "El id del producto es requerido",
    }),
    delete: z.boolean().optional(),
    status: z.enum(productStatusEnum).optional(),
    barcode: z.string().nullish(),
  });

export const updateProductValidator = createProductValidator.partial().extend({
  id: z.uuid({
    error: "El id del producto es requerido",
  }),
  status: z.enum(productStatusEnum).optional(),
  presentations: z.array(updateProductPresentationValidator).optional(),
});
