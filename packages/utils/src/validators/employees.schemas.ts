import { z } from "zod";

export const parseTeamOnEmployee = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100),
});

export const assignTeamsToEmployeeSchema = z.object({
  userId: z.string("El ID del empleado debe ser un UUID válido"),
  teamIds: z
    .array(z.string("El ID del equipo debe ser un UUID válido"))
    .min(1, "Debe asignar al menos un equipo"),
});

export type AssignTeamsToEmployeeSchema = z.infer<
  typeof assignTeamsToEmployeeSchema
>;
export const parseTeamsOnEmployee = z.array(parseTeamOnEmployee);
