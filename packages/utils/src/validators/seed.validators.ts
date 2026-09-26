import { z } from "zod";

export const seedUsersValidator = z.object({
  rootUsers: z.number().int().min(0).default(2),
});
