import { z } from "zod";
import { emailValidator, phoneValidator } from "./utils";

export const signUpEmailSchema = z.object({
  email: emailValidator,
  password: z
    .string("La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z
    .string("El nombre es obligatorio")
    .min(5, "El nombre debe tener al menos 5 caracteres"),
  phone: phoneValidator,
  cc: z
    .string("El numero de identificación es obligatorio")
    .min(5, "El numero de identificación debe tener al menos 5 caracteres"),
  address: z
    .string("La dirección es obligatoria")
    .min(5, "La dirección debe tener al menos 5 caracteres"),
});

export const signUpUsernameSchema = signUpEmailSchema.extend({
  username: z
    .string("El nombre de usuario es obligatorio")
    .min(5, "El nombre de usuario debe tener al menos 5 caracteres"),
});

export const signUpEmailFormSchema = signUpEmailSchema
  .extend({
    repeatPassword: z
      .string("Repite la contraseña")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Las contraseñas no coinciden",
    path: ["repeatPassword"],
  });

export const signInEmailSchema = z.object({
  email: emailValidator,
  password: z.string("La contraseña es obligatoria"),
});

export const resetPasswordSchema = z.object({
  email: emailValidator,
});

export type SignUpUsernameSchema = z.infer<typeof signUpUsernameSchema>;
export type SignUpEmailSchema = z.infer<typeof signUpEmailSchema>;
export type SignUpEmailFormSchema = z.infer<typeof signUpEmailFormSchema>;
export type SignInEmailSchema = z.infer<typeof signInEmailSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
