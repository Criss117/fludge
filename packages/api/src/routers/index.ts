import type { RouterClient } from "@orpc/server";

import { authRouter } from "@fludge/api/modules/iam/auth/infrastructure/http/auth.router";
import { organizationRouter } from "@fludge/api/modules/iam/organizations/infrastructure/http/organization.router";
import { groupsRouter } from "@fludge/api/modules/iam/groups/infrastructure/http/groups.router";
import { memberRouter } from "@fludge/api/modules/iam/members/infrastructure/http/member.router";
import { groupMembersRouter } from "@fludge/api/modules/iam/group-members/infrastructure/http/group-members.router";
import { seedRouter } from "./seed";

export const appRouter = {
  auth: authRouter,
  organizations: organizationRouter,
  groups: groupsRouter,
  members: memberRouter,
  seed: seedRouter,
  groupsMembers: groupMembersRouter,
} as const;

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
