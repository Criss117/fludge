import { createCustomerValidator } from "@fludge/utils/validators/customer.validators";
import { formOptions, useForm } from "@tanstack/react-form";
import type { z } from "zod";

export type CustomerFormSchema = z.input<typeof createCustomerValidator>;

export type OnCustomerSubmit = {
  onSubmit: (options: {
    value: CustomerFormSchema;
    resetForm: () => void;
  }) => void;
};

const defaultCustomerValues: CustomerFormSchema = {
  name: "",
  phone: "",
  email: "",
  creditLimit: 0,
  documentType: "",
  documentNumber: "",
};

export function customerFormOptions(
  options: OnCustomerSubmit,
  defaultValues?: CustomerFormSchema,
) {
  return formOptions({
    defaultValues: defaultValues ?? defaultCustomerValues,
    validators: {
      onChange: createCustomerValidator,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export function useCreateCustomerForm(options: OnCustomerSubmit) {
  return useForm(customerFormOptions(options));
}

export function useUpdateCustomerForm(
  defaultValues: CustomerFormSchema,
  options: OnCustomerSubmit,
) {
  return useForm(customerFormOptions(options, defaultValues));
}