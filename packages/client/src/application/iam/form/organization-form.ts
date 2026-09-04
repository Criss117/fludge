import { registerOrganizationValidator } from "@fludge/utils/validators/organization.validators";
import { formOptions, useForm } from "@tanstack/react-form";
import type { z } from "zod";

export type RegisterOrganizationSchema = z.infer<
  typeof registerOrganizationValidator
>;

export type OnRegisterSubmit = {
  onSubmit: (options: {
    value: RegisterOrganizationSchema;
    resetForm: () => void;
  }) => void;
};

export function registerFormOptions(options: OnRegisterSubmit) {
  return formOptions({
    defaultValues: {
      name: "",
      phone: "",
      legalName: "",
      taxId: "",
      address: "",
    },
    validators: {
      onChange: registerOrganizationValidator,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export function useRegisterOrganizationForm(options: OnRegisterSubmit) {
  return useForm(registerFormOptions(options));
}

type FieldComponent = ReturnType<typeof useRegisterOrganizationForm>["Field"];

export type RegisterOrganizationName = keyof RegisterOrganizationSchema;
export type RegisterOrganizationFieldApi<
  TName extends keyof RegisterOrganizationSchema,
> = {
  [K in TName]: FieldComponent extends (props: {
    name: K;
    children: (field: infer TFieldApi) => any;
  }) => any
    ? TFieldApi
    : never;
}[TName];
