import type { RouterClient } from "@orpc/server";

import { authRouter } from "@fludge/api/modules/iam/auth/infrastructure/http/auth.router";
import { organizationRouter } from "@fludge/api/modules/iam/organizations/infrastructure/http/organization.router";
import { groupsRouter } from "@fludge/api/modules/iam/groups/infrastructure/http/groups.router";

export const appRouter = {
  auth: authRouter,
  organizations: organizationRouter,
  groups: groupsRouter,
} as const;

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
