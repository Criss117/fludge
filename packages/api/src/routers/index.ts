import type { RouterClient } from "@orpc/server";

import { organizationsProcedures } from "../modules/organizations/procedures";

export const appRouter = {
  organizations: organizationsProcedures,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
