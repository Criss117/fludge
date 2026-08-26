import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.email({ error: "Ingresa un email válido" }),
  password: z.string().min(6, {
    error: "La contraseña debe tener al menos 6 caracteres",
  }),
});

export const signUpSchema = z.object({
  name: z.string().min(2, { error: "Ingresa un nombre válido" }),
  email: z.email({ error: "Ingresa un email válido" }),
  password: z.string().min(6, {
    error: "La contraseña debe tener al menos 6 caracteres",
  }),
  phone: z.string().min(10, { error: "Ingresa un número de teléfono válido" }),
});

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;

export type OnSignUpSubmit = {
  onSubmit: (options: { value: SignUpSchema; resetForm: () => void }) => void;
};

export type OnSignInSubmit = {
  onSubmit: (options: { value: SignInSchema; resetForm: () => void }) => void;
};

export function signUpFormOptions(options: OnSignUpSubmit) {
  return formOptions({
    defaultValues: {
      name: "Natalia Arturo",
      email: "natalia@fludge.dev",
      password: "holiwiss",
      phone: "3212345678",
    },
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}

export function signInFormOptions(options: OnSignInSubmit) {
  return formOptions({
    defaultValues: {
      email: "root0@fludge.com",
      password: "holiwiss",
    },
    validators: {
      onChange: signInSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}
