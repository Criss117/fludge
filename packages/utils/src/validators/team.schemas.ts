import { z } from "zod";
import { permissionsSchema } from "./permission.schemas";

export const createTeamSchema = z.object({
  name: z
    .string("El nombre del equipo es requerido")
    .min(2, "El nombre del equipo debe tener al menos 2 caracteres")
    .max(20, "El nombre del equipo es demasiado largo"),
  permissions: permissionsSchema,
  description: z
    .string()
    .max(100, "La descripción del equipo es demasiado larga")
    .nullable(),
});

export const updateTeamSchema = createTeamSchema.partial().extend({
  id: z.string("El id del equipo es requerido"),
});

export const removeManyTeamsSchema = z.object({
  ids: z.array(z.string()).min(1, "Debe seleccionar al menos un equipo"),
});

export const assignEmployeesToTeamSchema = z.object({
  teamId: z.string("El id del equipo es requerido"),
  userIds: z.array(z.string()).min(1, "Debe seleccionar al menos un empleado"),
});

export const parseEmployeeOnTeamSchema = z.object({
  id: z.string("El id del usuario es requerido"),
  name: z.string("El nombre del usuario es requerido"),
});

export const parseEmployeesOnTeamSchema = z.array(parseEmployeeOnTeamSchema);

export type AssignEmployeesToTeamSchema = z.infer<
  typeof assignEmployeesToTeamSchema
>;
export type RemoveManyTeamsSchema = z.infer<typeof removeManyTeamsSchema>;
export type CreateTeamSchema = z.infer<typeof createTeamSchema>;
export type UpdateTeamSchema = z.infer<typeof updateTeamSchema>;
