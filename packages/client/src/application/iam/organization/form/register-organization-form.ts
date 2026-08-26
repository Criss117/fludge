import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const registerOrganizationSchema = z.object({
  name: z
    .string({
      error: "El nombre es requerido",
    })
    .min(3, {
      error: "El nombre es muy corto",
    })
    .max(50, {
      error: "El nombre es muy largo",
    }),
  phone: z
    .string({
      error: "El teléfono es requerido",
    })
    .min(9, {
      error: "El teléfono es muy corto",
    })
    .max(15, {
      error: "El teléfono es muy largo",
    }),
  legalName: z
    .string({
      error: "La razón social es requerida",
    })
    .min(3, {
      error: "La razón social es muy corta",
    })
    .max(50, {
      error: "La razón social es muy larga",
    }),
  taxId: z
    .string({
      error: "El NIT es requerido",
    })
    .min(9, {
      error: "El NIT es muy corto",
    })
    .max(15, {
      error: "El NIT es muy largo",
    }),
  address: z
    .string({
      error: "La dirección es requerida",
    })
    .min(5, {
      error: "La dirección es muy corta",
    })
    .max(50, {
      error: "La dirección es muy larga",
    }),
});

export type RegisterOrganizationSchema = z.infer<
  typeof registerOrganizationSchema
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
      name: "Fludge",
      phone: "3212345678",
      legalName: "Fludge",
      taxId: "123456789",
      address: "Calle de la casa, 123",
    },
    validators: {
      onChange: registerOrganizationSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}
