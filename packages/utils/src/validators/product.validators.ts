import { z } from "zod";
import { productStatusEnum } from "../enums/db-enums";
import {
  descriptionSchema,
  getI18nKey,
  nameSchema,
  uuidSchema,
} from "./shared";

export const barcodeSchema = z
  .string({
    error: getI18nKey("validators.barcode.invalid"),
  })
  .min(6, {
    error: getI18nKey("validators.barcode.min_length"),
  })
  .max(100, {
    error: getI18nKey("validators.barcode.max_length"),
  });

export const conversionFactorSchema = z.coerce
  .number<number>({
    error: getI18nKey("validators.conversion_factor.invalid"),
  })
  .int({
    error: getI18nKey("validators.conversion_factor.integer"),
  })
  .positive({
    error: getI18nKey("validators.conversion_factor.positive"),
  });

export const priceSaleSchema = z.coerce
  .number<number>({
    error: getI18nKey("validators.price_sale.invalid"),
  })
  .int({
    error: getI18nKey("validators.price_sale.integer"),
  })
  .positive({
    error: getI18nKey("validators.price_sale.positive"),
  });

export const pricePurchaseSchema = z.literal(0).or(
  z.coerce
    .number<number>({
      error: getI18nKey("validators.price_purchase.invalid"),
    })
    .int({
      error: getI18nKey("validators.price_purchase.integer"),
    })
    .positive({
      error: getI18nKey("validators.price_purchase.positive"),
    }),
);

export const priceWholesaleSchema = z.literal(0).or(
  z.coerce
    .number<number>({
      error: getI18nKey("validators.price_wholesale.invalid"),
    })
    .int({
      error: getI18nKey("validators.price_wholesale.integer"),
    })
    .positive({
      error: getI18nKey("validators.price_wholesale.positive"),
    }),
);

export const productStatusSchema = z.enum(productStatusEnum, {
  error: getI18nKey("validators.product_status.invalid"),
});

export const stockSchema = z.coerce
  .number<number>({
    error: getI18nKey("validators.stock.invalid"),
  })
  .int({
    error: getI18nKey("validators.stock.integer"),
  })
  .positive({
    error: getI18nKey("validators.stock.positive"),
  });

export const minStockSchema = z.coerce
  .number<number>({
    error: getI18nKey("validators.min_stock.invalid"),
  })
  .int({
    error: getI18nKey("validators.min_stock.integer"),
  })
  .positive({
    error: getI18nKey("validators.min_stock.positive"),
  });

export const createProductPresentationValidator = z.object({
  name: nameSchema,
  barcode: barcodeSchema.optional(),
  conversionFactor: conversionFactorSchema,
  priceSale: priceSaleSchema,
  pricePurchase: pricePurchaseSchema.optional(),
  priceWholesale: priceWholesaleSchema.optional(),
});

export const updateProductPresentationValidator =
  createProductPresentationValidator.extend({
    id: uuidSchema,
    status: productStatusSchema,
    delete: z.boolean().optional(),
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

export const updateProductValidator = createProductValidator.extend({
  id: uuidSchema,
  status: productStatusSchema,
  presentations: z.array(updateProductPresentationValidator).min(1, {
    error: getI18nKey("validators.array.at_least_one"),
  }),
});
