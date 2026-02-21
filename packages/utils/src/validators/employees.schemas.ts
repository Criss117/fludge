import { z } from "zod";

export const parseTeamOnEmployee = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100),
});

export const parseTeamsOnEmployee = z.array(parseTeamOnEmployee);
