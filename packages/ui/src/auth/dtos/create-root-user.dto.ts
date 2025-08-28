import { z } from "zod";

export const createRootUserDto = z.object({
  email: z.email({
    error: "El correo electrónico no es válido",
  }),
  password: z.string(),
  username: z
    .string({
      message: "El nombre de usuario no puede estar vacío",
    })
    .min(5, {
      message: "El nombre de usuario debe tener como mínimo 5 caracteres",
    })
    .max(100, {
      message: "El nombre de usuario debe tener como máximo 100 caracteres",
    }),
  firstName: z
    .string({
      message: "El nombre del usuario no puede estar vacío",
    })
    .min(5, {
      message: "El nombre del usuario debe tener como mínimo 5 caracteres",
    })
    .max(100, {
      message: "El nombre del usuario debe tener como máximo 100 caracteres",
    }),
  lastName: z
    .string({
      message: "El apellido del usuario no puede estar vacío",
    })
    .min(5, {
      message: "El apellido del usuario debe tener como mínimo 5 caracteres",
    })
    .max(100, {
      message: "El apellido del usuario debe tener como máximo 100 caracteres",
    }),
});

export type CreateRootUserDto = z.infer<typeof createRootUserDto>;
