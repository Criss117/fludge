import type { RouterClient } from "@orpc/server";

import { protectedProcedure, withPermissionsProcedure } from "../index";

export const appRouter = {
  healthCheck: withPermissionsProcedure("adios").handler(({ context }) => {
    return context.message;
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
