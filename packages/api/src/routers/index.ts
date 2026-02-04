import type { RouterClient } from "@orpc/server";

import { organizationsProcedures } from "../modules/organizations/organizations-procedures";
import { authProcedures } from "../modules/auth/auth-procedures";

export const appRouter = {
  organizations: organizationsProcedures,
  auth: authProcedures,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
