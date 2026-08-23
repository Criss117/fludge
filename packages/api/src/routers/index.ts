import type { RouterClient } from "@orpc/server";

import { organizationRouter } from "../modules/iam/organization/infrastructure/http/organization.router";
import { authRouter } from "../modules/iam/auth/infrastructure/http/auth.router";
import { groupRouter } from "../modules/iam/organization/infrastructure/http/group.router";
import { memberRouter } from "../modules/iam/organization/infrastructure/http/member.router";

export const appRouter = {
  organization: organizationRouter,
  group: groupRouter,
  auth: authRouter,
  member: memberRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
