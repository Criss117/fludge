import { createCustomerPaymentValidator } from "@fludge/utils/validators/customer-payment.validators";
import { formOptions, useForm } from "@tanstack/react-form";
import type { z } from "zod";

const createCustomerPayment = createCustomerPaymentValidator.omit({
  customerId: true,
});

export type CustomerPaymentFormSchema = z.input<typeof createCustomerPayment>;

export type OnCustomerPaymentSubmit = {
  onSubmit: (options: {
    value: CustomerPaymentFormSchema;
    resetForm: () => void;
  }) => void;
};

const defaultCustomerPaymentValues: CustomerPaymentFormSchema = {
  amount: 0,
  method: "cash",
  notes: "",
};

export function customerPaymentFormOptions(
  options: OnCustomerPaymentSubmit,
  defaultValues?: CustomerPaymentFormSchema,
) {
  return formOptions({
    defaultValues: defaultValues ?? defaultCustomerPaymentValues,
    validators: {
      onChange: createCustomerPaymentValidator,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export function useCreateCustomerPaymentForm(options: OnCustomerPaymentSubmit) {
  return useForm(customerPaymentFormOptions(options));
}
