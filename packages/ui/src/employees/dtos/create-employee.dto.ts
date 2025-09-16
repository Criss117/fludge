import z from "zod";

export const createEmployeeDto = z.object({
  password: z.string().max(255, {
    message: "La contraseña no puede tener más de 255 caracteres",
  }),
  username: z
    .string({
      error: "El nombre de usuario no puede estar vacío",
    })
    .min(5, {
      message: "El nombre de usuario debe tener como mínimo 5 caracteres",
    })
    .max(100, {
      message: "El nombre de usuario debe tener como máximo 100 caracteres",
    }),
  firstName: z
    .string({
      error: "El nombre del usuario no puede estar vacío",
    })
    .min(5, {
      message: "El nombre del usuario debe tener como mínimo 5 caracteres",
    })
    .max(100, {
      message: "El nombre del usuario debe tener como máximo 100 caracteres",
    }),
  lastName: z
    .string({
      error: "El apellido del usuario no puede estar vacío",
    })
    .min(5, {
      message: "El apellido del usuario debe tener como mínimo 5 caracteres",
    })
    .max(100, {
      message: "El apellido del usuario debe tener como máximo 100 caracteres",
    }),
  groupIds: z.array(
    z.uuid({ message: "Cada elemento debe ser un UUID válido" })
  ),
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeDto>;
