import { os } from "@orpc/server";
import type { Context } from "./context";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@core/shared/exceptions/base-exception";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session)
    throw new UnauthorizedError("api_errors.auth.sessions.unauthorized");

  return next({
    context: {
      session: context.session,
    },
  });
});

const rootOnly = requireAuth.concat(({ context, next }) => {
  if (!context.session.user.isRoot)
    throw new ForbiddenError("api_errors.auth.users.not_root");

  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);
export const rootOnlyProcedure = publicProcedure.use(rootOnly);
