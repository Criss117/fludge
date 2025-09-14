import z from "zod";

export const updateGroupDto = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(255).optional(),
});

export type UpdateGroupDto = z.infer<typeof updateGroupDto>;
