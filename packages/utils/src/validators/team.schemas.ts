import { z } from "zod";
import { permissionsSchema } from "./permission.schemas";

export const createTeamSchema = z.object({
  name: z.string().min(2).max(100),
  permissions: permissionsSchema,
  employeesId: z.array(z.string()).optional(),
});

export type CreateTeamSchema = z.infer<typeof createTeamSchema>;
