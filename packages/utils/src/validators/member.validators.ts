import { z } from "zod";
import { uuidSchema } from "./shared";

export const assignGroupsToMemberValidator = z.object({
  memberId: uuidSchema("El id del miembro es requerido"),
  groupIds: z.array(uuidSchema("El id del grupo es requerido")).min(1, {
    error: "Debe especificar al menos un grupo",
  }),
});
