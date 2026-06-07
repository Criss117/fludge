import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

const signInSchema = z.object({
  email: z.email({ error: "Ingresa un email válido" }),
  password: z.string().min(6, {
    error: "La contraseña debe tener al menos 6 caracteres",
  }),
});

const signUpSchema = z.object({
  email: z.email({
    error: "El email es requerido",
  }),
  password: z
    .string({
      error: "La contraseña es requerida",
    })
    .min(8, {
      error: "La contraseña es muy corta",
    })
    .max(50, {
      error: "La contraseña es muy larga",
    }),
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
});

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;

export type OnSignInSubmit = {
  onSubmit: (options: { value: SignInSchema; resetForm: () => void }) => void;
};

export type OnSignUpSubmit = {
  onSubmit: (options: { value: SignUpSchema; resetForm: () => void }) => void;
};

export function signInFormOptions(options: OnSignInSubmit) {
  return formOptions({
    defaultValues: {
      email: "natalia@fludge.dev",
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

export function signUpFormOptions(options: OnSignUpSubmit) {
  return formOptions({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
    },
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: ({ value, formApi }) => {
      options.onSubmit({ value, resetForm: formApi.reset });
    },
  });
}
