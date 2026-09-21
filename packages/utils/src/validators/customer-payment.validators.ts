import { z } from "zod";
import {
  customerPaymentMethodEnum,
  customerPaymentStatusEnum,
} from "../enums/db-enums";

export const customerPaymentMethodSchema = z.enum(customerPaymentMethodEnum, {
  message: "api_errors.customer_payments.invalid_method",
});

export const customerPaymentStatusSchema = z.enum(customerPaymentStatusEnum, {
  message: "api_errors.customer_payments.invalid_status",
});

export const createCustomerPaymentValidator = z.object({
  customerId: z.string().min(1, "api_errors.customer_payments.customer_id_required"),
  amount: z.number().positive("api_errors.customer_payments.amount_must_be_positive"),
  method: customerPaymentMethodSchema,
  notes: z.string().optional().nullable(),
});

export const cancelCustomerPaymentValidator = z.object({
  paymentId: z.string().min(1, "api_errors.customer_payments.payment_id_required"),
  reason: z.string().min(3, "api_errors.customer_payments.reason_too_short").max(500, "api_errors.customer_payments.reason_too_long"),
});