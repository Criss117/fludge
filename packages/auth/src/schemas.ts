import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .email("El correo electrónico no es válido")
      .min(1, "El correo electrónico es obligatorio"),
    password: z
      .string("La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    name: z
      .string("El nombre es obligatorio")
      .min(5, "El nombre debe tener al menos 5 caracteres"),
    repeatPassword: z
      .string("Repite la contraseña")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Las contraseñas no coinciden",
    path: ["repeatPassword"],
  });

export const loginSchema = z.object({
  email: z.email("El correo electrónico no es válido"),
  password: z.string("La contraseña es obligatoria"),
});

export const resetPasswordSchema = z.object({
  email: z
    .email("El correo electrónico no es válido")
    .min(1, "El correo electrónico es obligatorio"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
