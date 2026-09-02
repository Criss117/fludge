import { z } from "zod";
import { permissionsSchema } from "../permissions";
import {
  descriptionSchema,
  nameSchema,
  statusSchema,
  uuidSchema,
} from "./shared";

export const createGroupValidator = z.object({
  name: nameSchema,
  description: descriptionSchema,
  permissions: permissionsSchema,
});

export const updateGroupValidator = z.object({
  id: uuidSchema("El id del grupo es requerido"),
  name: nameSchema.optional(),
  description: descriptionSchema.optional(),
  permissions: permissionsSchema.optional(),
  status: statusSchema.optional(),
});

export const assignMembersToGroupValidator = z.object({
  groupId: uuidSchema("El id del grupo es requerido"),
  memberIds: z.array(uuidSchema("El id del miembro es requerido")).min(1, {
    error: "Debe especificar al menos un miembro",
  }),
});

export const deleteGroupsValidator = z.object({
  groupIds: z.array(uuidSchema("El id del grupo es requerido")).min(1, {
    error: "Debe especificar al menos un grupo",
  }),
});
