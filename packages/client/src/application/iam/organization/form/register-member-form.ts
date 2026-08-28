import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const registerMemberSchema = z.object({
  email: z
    .string({ error: "El email es requerido" })
    .email("Ingresa un email válido"),
  password: z
    .string({ error: "La contraseña es requerida" })
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  phone: z
    .string({ error: "El teléfono es requerido" })
    .min(9, "El teléfono es muy corto")
    .max(15, "El teléfono es muy largo"),
  name: z
    .string({ error: "El nombre es requerido" })
    .min(2, "El nombre es muy corto")
    .max(50, "El nombre es muy largo"),
});

export type RegisterMemberSchema = z.infer<typeof registerMemberSchema>;

export type OnRegisterMemberSubmit = {
  onSubmit: (options: {
    value: RegisterMemberSchema;
    resetForm: () => void;
  }) => void;
};

export function registerFormOptions(options: OnRegisterMemberSubmit) {
  return formOptions({
    defaultValues: {
      email: "",
      password: "",
      phone: "",
      name: "",
    },
    validators: {
      onChange: registerMemberSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}
