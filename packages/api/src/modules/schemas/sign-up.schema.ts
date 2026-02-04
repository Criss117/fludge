import { z } from "zod";

export const signUpSchema = z.object({
  email: z
    .email("El correo electrónico no es válido")
    .min(1, "El correo electrónico es obligatorio"),
  password: z
    .string("La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z
    .string("El nombre es obligatorio")
    .min(5, "El nombre debe tener al menos 5 caracteres"),
});
