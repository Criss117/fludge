import { z } from "zod";

export const assignGroupsToMemberValidator = z.object({
  memberId: z.uuid({
    error: "El id del grupo es requerido",
  }),
  groupIds: z
    .array(
      z.uuid({
        error: "El id del miembro es requerido",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un miembro",
    }),
});
