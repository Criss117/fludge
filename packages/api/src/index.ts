import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(({ context, next }) => {
  if (!context.session?.user)
    throw new ORPCError("UNAUTHORIZED", {
      message: "Debe iniciar sesión para acceder a este recurso.",
    });

  return next({
    context: {
      session: context.session,
    },
  });
});

const rootOnly = requireAuth.concat(({ context, next }) => {
  if (!context.session.user.isRoot)
    throw new ORPCError("FORBIDDEN", {
      message: "Solo el usuario root puede acceder a este recurso.",
    });

  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);
export const rootOnlyProcedure = publicProcedure.use(rootOnly);
