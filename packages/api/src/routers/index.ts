import type { RouterClient } from "@orpc/server";

import { organizationsProcedures } from "../modules/organizations/organizations-procedures";
import { authProcedures } from "../modules/auth/auth-procedures";
import { teamsProcedures } from "../modules/teams/teams.procedures";

export const appRouter = {
  organizations: organizationsProcedures,
  auth: authProcedures,
  teams: teamsProcedures,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
