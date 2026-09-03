import { z } from "zod";
import { getI18nKey, uuidSchema } from "./shared";

export const assignGroupsToMemberValidator = z.object({
  memberId: uuidSchema(),
  groupIds: z.array(uuidSchema()).min(1, {
    error: getI18nKey("validators.members.group_ids.required"),
  }),
});
