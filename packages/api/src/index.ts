import { os, type Route } from "@orpc/server";

import type { Context } from "./context";

export const baseRouter = os.$context<Context>();

export function baseProcedure(route?: Route) {
  const defaultRoute = route ?? { method: "POST" };

  return baseRouter.$context<Context>().route(defaultRoute);
}
