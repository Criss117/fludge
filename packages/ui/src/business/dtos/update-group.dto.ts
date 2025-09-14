import z from "zod";
import { allPermissions } from "./create-group.dto";

export const updateGroupDto = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(255).optional(),
  permissions: z.array(z.enum(allPermissions)).optional(),
});

export type UpdateGroupDto = z.infer<typeof updateGroupDto>;
