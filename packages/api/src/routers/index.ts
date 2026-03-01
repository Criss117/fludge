import type { RouterClient } from "@orpc/server";

import { organizationsProcedures } from "../modules/organizations/organizations.procedures";
import { authProcedures } from "../modules/auth/auth-procedures";
import { teamsProcedures } from "../modules/teams/teams.procedures";
import { employeesProcedures } from "../modules/employees/employees.procedures";
import { inventoryProcedures } from "../modules/inventory/inventory.procedures";
import { seedProcedures } from "../modules/seed/seed.procedures";

export const appRouter = {
  organizations: organizationsProcedures,
  auth: authProcedures,
  teams: teamsProcedures,
  employees: employeesProcedures,
  inventory: inventoryProcedures,
  seed: seedProcedures,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
