import { z } from "zod";
import { getI18nKey, nameSchema, notesSchema, uuidSchema } from "./shared";
import { paymentTypeEnum } from "../enums/db-enums";

export const paymentTypeSchema = z.enum(paymentTypeEnum, {
  error: getI18nKey("validators.payment_type.invalid"),
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
    presentationId: z.undefined(),
  }),
  z.object({
    quantity: quantitySchema,
    price: priceSchema,
    name: z.undefined(),
    presentationId: uuidSchema,
  }),
]);

export const createSaleValidator = z
  .object({
    customerId: uuidSchema.optional(),
    paymentType: paymentTypeSchema,
    notes: notesSchema,
    items: z.array(createSaleItemValidator).min(1, {
      error: getI18nKey("validators.array.sale_items.at_least_one"),
    }),
  })
  .refine((data) => data.paymentType === "credit" && data.customerId !== null, {
    message: getI18nKey("validators.customers.required"),
    path: ["customerId"],
  });
