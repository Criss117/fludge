import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";
import { auth } from "@fludge/auth";

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

type RequireOrganizationOptions = {
  onlyOwner?: boolean;
};

function requireOrganization(options?: RequireOrganizationOptions) {
  return requireAuth.concat(async ({ context, next }) => {
    const activeOrganizationId = context.session.activeOrganizationId;

    if (!activeOrganizationId)
      throw new ORPCError("UNAUTHORIZED", {
        message: "No tienes una organización activa.",
      });

    const organization = await auth.api.getFullOrganization({
      headers: context.headers,
    });

    if (!organization)
      throw new ORPCError("UNAUTHORIZED", {
        message: "No tienes una organización activa.",
      });

    const userIsOwner = organization.members.some(
      (member) =>
        member.userId === context.session.user.id && member.role === "owner",
    );

    if (options?.onlyOwner && !userIsOwner)
      throw new ORPCError("FORBIDDEN", {
        message: "No tienes permisos para acceder a esta organización.",
      });

    return next({
      context: {
        ...context,
        session: {
          ...context.session,
          activeOrganization: organization,
        },
      },
    });
  });
}

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
export function withOrganization(options?: RequireOrganizationOptions) {
  return publicProcedure.use(requireOrganization(options));
}
