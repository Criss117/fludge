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

const presentationSchema = z.object({
  id: uuidSchema.or(z.literal("")).transform((v) => (v === "" ? undefined : v)),

  name: nameSchema,
  price: priceSchema,
});

export const createSaleItemValidator = z.object({
  quantity: quantitySchema,
  presentation: presentationSchema,
});

export const createSaleValidator = z.object({
  customerId: uuidSchema
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  paymentType: paymentTypeSchema,
  notes: notesSchema,
  items: z
    .array(createSaleItemValidator)
    .min(1, { error: getI18nKey("validators.array.sale_items.at_least_one") }),
});
