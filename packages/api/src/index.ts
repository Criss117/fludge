import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";
import { auth } from "@fludge/auth";
import type { Permission } from "@fludge/utils/permissions/data";
import { groupsContainer } from "./modules/iam/groups/container";
import { checkPermissions } from "@fludge/utils/permissions/index";

type RequireOrganizationOptions =
  | {
      onlyOwner: true;
    }
  | {
      requirePermission: Permission | Permission[];
    };

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

function requireOrganization(options: RequireOrganizationOptions) {
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

    if ("onlyOwner" in options) {
      if (!userIsOwner)
        throw new ORPCError("FORBIDDEN", {
          message: "No tienes permisos requeridos para esta acción.",
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
    }

    if (userIsOwner)
      return next({
        context: {
          ...context,
          session: {
            ...context.session,
            activeOrganization: organization,
          },
        },
      });

    const memberInfo = organization.members.find(
      (m) => m.user.id === context.session.user.id,
    );

    if (!memberInfo)
      throw new ORPCError("FORBIDDEN", {
        message: "No tienes permisos requeridos para esta acción.",
      });

    const memberGroups = await groupsContainer.queries.findAllByMember.execute(
      memberInfo.id,
    );

    const userPermissions = memberGroups.flatMap((g) => g.permissions);

    const hasPemissions = checkPermissions(
      userPermissions,
      options.requirePermission,
    );

    if (!hasPemissions)
      throw new ORPCError("FORBIDDEN", {
        message: "No tienes permisos requeridos para esta acción.",
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
export function withOrganization(options: RequireOrganizationOptions) {
  return publicProcedure.use(requireOrganization(options));
}
