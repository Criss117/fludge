import { z } from "zod";
import { permissionsSchema } from "@fludge/utils/permissions/index";
import { statusEnum } from "../enums/db-enums";

export const createGroupValidator = z.object({
  name: z.string({
    error: "El nombre es requerido",
  }),
  description: z.string({
    error: "La descripción es requerida",
  }),
  permissions: permissionsSchema,
});

export const updateGroupValidator = createGroupValidator.partial().extend({
  id: z.uuid({
    error: "El id del grupo es requerido",
  }),
  status: z.enum(statusEnum).optional(),
});

export const assignMembersToGroupValidator = z.object({
  groupId: z.uuid({
    error: "El id del grupo es requerido",
  }),
  memberIds: z
    .array(
      z.uuid({
        error: "El id del miembro es requerido",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un miembro",
    }),
});

export const deleteGroupsValidator = z.object({
  groupIds: z.array(z.uuid({ error: "El id del grupo es requerido" })).min(1, {
    error: "Debe especificar al menos un grupo",
  }),
});
