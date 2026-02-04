import { os } from "@orpc/server";

import type { Context } from "./context";

export const baseProcedure = os.$context<Context>();
