import { z } from "zod";

export const assignGroupsToEmployeeCommand = z.object({
  memberId: z.string({
    error: "Id de miembro no válido.",
  }),
  groupIds: z
    .array(
      z.uuid({
        error: "Id de grupo no válido.",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de grupo.",
    }),
});

type CMD = z.infer<typeof assignGroupsToEmployeeCommand> & {
  organizationId: string;
};

export class AssignGroupsToEmployeeCommand {
  constructor() {}
}
