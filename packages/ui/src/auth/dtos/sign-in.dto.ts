import { z } from "zod";

export const signInDto = z.object({
  email: z.email({
    error: "El email es obligatorio",
  }),
  password: z
    .string({
      error: "La contraseña es obligatoria",
    })
    .max(255, {
      message: "La contraseña debe tener menos de 255 caracteres",
    }),
});

export const signInEmployeeDto = z.object({
  username: z
    .string({
      error: "El nombre de usuario es obligatorio",
    })
    .max(100, {
      message: "El nombre de usuario debe tener menos de 100 caracteres",
    }),
  password: z
    .string({
      error: "La contraseña es obligatoria",
    })
    .max(255, {
      message: "La contraseña debe tener menos de 255 caracteres",
    }),
});

export type SignInDto = z.infer<typeof signInDto>;
export type SignInEmployeeDto = z.infer<typeof signInEmployeeDto>;
