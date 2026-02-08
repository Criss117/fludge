import { z } from "zod";
import { permissionsSchema } from "./permission.schemas";

export const createTeamSchema = z.object({
  name: z
    .string("El nombre del equipo es requerido")
    .min(2, "El nombre del equipo debe tener al menos 2 caracteres")
    .max(20, "El nombre del equipo es demasiado largo"),
  permissions: permissionsSchema,
  employeesId: z.array(z.string()).optional(),
  description: z
    .string()
    .min(2, "La descripción del equipo debe tener al menos 2 caracteres")
    .max(50, "La descripción del equipo es demasiado larga")
    .optional(),
});

export type CreateTeamSchema = z.infer<typeof createTeamSchema>;
