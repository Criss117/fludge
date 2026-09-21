import { z } from "zod";
import { getI18nKey, nameSchema, notesSchema, uuidSchema } from "./shared";
import { paymentTypeEnum, saleStatusEnum } from "../enums/db-enums";

export const paymentTypeSchema = z.enum(paymentTypeEnum, {
  error: getI18nKey("validators.payment_type.invalid"),
});

export const saleStatusSchema = z.enum(saleStatusEnum, {
  error: getI18nKey("validators.sale_status.invalid"),
});

export const quantitySchema = z
  .number({
    error: getI18nKey("validators.quantity.invalid"),
  })
  .positive({
    error: getI18nKey("validators.quantity.positive"),
  });

export const priceSchema = z
  .number({
    error: getI18nKey("validators.price_sale.invalid"),
  })
  .positive({
    error: getI18nKey("validators.price_sale.positive"),
  });

export const createSaleItemValidator = z.union([
  z.object({
    quantity: quantitySchema,
    price: priceSchema,
    name: nameSchema,
  }),
  z.object({
    quantity: quantitySchema,
    price: priceSchema,
    presentationId: uuidSchema,
  }),
]);

export const createSaleValidator = z.object({
  customerId: uuidSchema.optional(),
  paymentType: paymentTypeSchema,
  notes: notesSchema,
  items: z.array(createSaleItemValidator).min(1, {
    error: getI18nKey("validators.array.sale_items.at_least_one"),
  }),
});

export const refundSaleItemsValidator = z.object({
  id: uuidSchema,
  itemIds: z
    .array(uuidSchema)
    .min(1, { error: getI18nKey("validators.array.sale_items.at_least_one") }),
});

export const cancelSaleValidator = z.object({
  id: uuidSchema,
  cancellationReason: notesSchema,
});
