import { z } from "zod";

export const seedUsersValidator = z.object({
  rootUsers: z.number().int().min(0).default(2),
  memberUsers: z.number().int().min(0).default(10),
});