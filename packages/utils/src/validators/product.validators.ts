import { z } from "zod";
import { productStatusEnum } from "../enums/db-enums";
import {
  descriptionSchema,
  getI18nKey,
  nameSchema,
  uuidSchema,
} from "./shared";

const barcodeSchema = z
  .string({
    error: getI18nKey("validators.barcode.invalid"),
  })
  .min(6, {
    error: getI18nKey("validators.barcode.min_length"),
  })
  .max(100, {
    error: getI18nKey("validators.barcode.max_length"),
  });

const conversionFactorSchema = z
  .number({
    error: getI18nKey("validators.conversion_factor.invalid"),
  })
  .int({
    error: getI18nKey("validators.conversion_factor.integer"),
  })
  .positive({
    error: getI18nKey("validators.conversion_factor.positive"),
  });

const priceSchema = z
  .number({
    error: getI18nKey("validators.price.invalid"),
  })
  .int({
    error: getI18nKey("validators.price.integer"),
  })
  .positive({
    error: getI18nKey("validators.price.positive"),
  });

const productStatusSchema = z.enum(productStatusEnum, {
  error: getI18nKey("validators.product_status.invalid"),
});

const stockSchema = z.coerce
  .number<number>({
    error: getI18nKey("validators.stock.invalid"),
  })
  .int({
    error: getI18nKey("validators.stock.integer"),
  })
  .positive({
    error: getI18nKey("validators.stock.positive"),
  });

const minStockSchema = z.coerce
  .number<number>({
    error: getI18nKey("validators.min_stock.invalid"),
  })
  .int({
    error: getI18nKey("validators.min_stock.integer"),
  })
  .min(0, {
    error: getI18nKey("validators.min_stock.positive"),
  });

export const createProductPresentationValidator = z.object({
  name: nameSchema,
  barcode: barcodeSchema,
  conversionFactor: conversionFactorSchema,
  pricePurchase: priceSchema.optional(),
  priceSale: priceSchema,
  priceWholesale: priceSchema.optional(),
});

export const updateProductPresentationValidator = z.object({
  id: uuidSchema,
  delete: z.boolean().optional(),
  status: productStatusSchema.optional(),
  name: nameSchema.optional(),
  barcode: barcodeSchema.optional(),
  conversionFactor: conversionFactorSchema.optional(),
  pricePurchase: priceSchema.optional(),
  priceSale: priceSchema.optional(),
  priceWholesale: priceSchema.optional(),
});

export const createProductValidator = z.object({
  name: nameSchema,
  categoryId: uuidSchema.optional(),
  description: descriptionSchema,
  stock: stockSchema,
  minStock: minStockSchema,
  allowNegativeStock: z.boolean(),
  presentations: z.array(createProductPresentationValidator).min(1, {
    error: getI18nKey("validators.array.at_least_one"),
  }),
});

export const deleteProductValidator = z.object({
  id: uuidSchema,
});

export const updateProductValidator = z.object({
  id: uuidSchema,
  status: productStatusSchema.optional(),
  name: nameSchema,
  categoryId: uuidSchema.optional(),
  description: descriptionSchema,
  stock: stockSchema,
  minStock: minStockSchema,
  allowNegativeStock: z.boolean(),
  presentations: z.array(updateProductPresentationValidator).optional(),
});
