import { registerOrganizationValidator } from "@fludge/utils/validators/organization.validators";
import { formOptions } from "@tanstack/react-form";
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
