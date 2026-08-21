import type { RouterClient } from "@orpc/server";

import { organizationRouter } from "../modules/iam/organization/infrastructure/http/organization.router";

export const appRouter = {
  organization: organizationRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
