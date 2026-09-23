import { z } from "zod";
import { customerPaymentMethodEnum } from "../enums/db-enums";
import { uuidSchema } from "./shared";

export const customerPaymentMethodSchema = z.enum(customerPaymentMethodEnum, {
  message: "api_errors.customer_payments.invalid_method",
});

export const createCustomerPaymentValidator = z.object({
  customerId: uuidSchema,
  amount: z
    .number()
    .positive("api_errors.customer_payments.amount_must_be_positive"),
  method: customerPaymentMethodSchema,
  notes: z.string().optional().nullable(),
});

export const cancelCustomerPaymentValidator = z.object({
  customerId: uuidSchema,
  paymentId: uuidSchema,
  reason: z
    .string()
    .min(3, "api_errors.customer_payments.reason_too_short")
    .max(500, "api_errors.customer_payments.reason_too_long"),
});
