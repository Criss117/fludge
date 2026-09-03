import { z } from "zod";
import { permissionsValidator } from "../permissions";
import {
  descriptionSchema,
  getI18nKey,
  nameSchema,
  statusSchema,
  uuidSchema,
} from "./shared";

export const createGroupValidator = z.object({
  name: nameSchema,
  description: descriptionSchema,
  permissions: permissionsValidator,
});

export const updateGroupValidator = z.object({
  id: uuidSchema(),
  name: nameSchema.optional(),
  description: descriptionSchema.optional(),
  permissions: permissionsValidator.optional(),
  status: statusSchema.optional(),
});

export const assignMembersToGroupValidator = z.object({
  groupId: uuidSchema(),
  memberIds: z.array(uuidSchema()).min(1, {
    error: getI18nKey("validators.groups.member_ids.required"),
  }),
});

export const deleteGroupsValidator = z.object({
  groupIds: z.array(uuidSchema()).min(1, {
    error: getI18nKey("validators.groups.member_ids.required"),
  }),
});
