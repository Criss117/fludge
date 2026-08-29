import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";
import { organizationContainer } from "./modules/iam/organization/container";
import type { AppStatement } from "@fludge/utils/permissions/data";
import { UUID } from "@fludge/utils/uuid";
import { env } from "@fludge/env/server";
import { permissionsFromObject } from "@fludge/utils/permissions/index";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session)
    throw new ORPCError("UNAUTHORIZED", {
      message: "No ha iniciado sesión",
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

const requireOrganization = requireAuth.concat(async ({ context, next }) => {
  const activeOrganizationId = context.session.activeOrganizationId;

  if (!activeOrganizationId)
    throw new ORPCError("FORBIDDEN", {
      message: "No hay una organización activa",
    });

  const [organization, errOrganization] =
    await organizationContainer.repositories.organizationRepository.findOneById(
      context.session.user.id,
      activeOrganizationId,
    );

  if (errOrganization)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Error al recuperar la organización",
      cause: errOrganization.cause,
    });

  if (!organization)
    throw new ORPCError("NOT_FOUND", {
      message: "No se encontró la organización",
    });

  const loggedUserIsMember = organization.members.getMemberByUserId(
    UUID.fromString(context.session.user.id),
  );

  if (!loggedUserIsMember)
    throw new ORPCError("FORBIDDEN", {
      message: "El usuario no es miembro de la organización",
    });

  if (loggedUserIsMember.status.isInactive())
    throw new ORPCError("FORBIDDEN", {
      message: "El usuario no tiene permisos para acceder a esta organización",
    });

  return next({
    context: {
      session: { ...context.session, activeOrganization: organization },
    },
  });
});

function hasPermission(permission: AppStatement) {
  return requireOrganization.concat(({ context, next }) => {
    const userMember =
      context.session.activeOrganization.members.getMemberByUserId(
        UUID.fromString(context.session.user.id),
      );

    if (!userMember)
      throw new ORPCError("FORBIDDEN", {
        message: "El usuario no es miembro de la organización",
      });

    const hasPermissions =
      context.session.activeOrganization.memberHasPermission(
        userMember.id,
        permissionsFromObject(permission),
      );

    if (!hasPermissions)
      throw new ORPCError("FORBIDDEN", {
        message: "No tiene permisos para realizar esta operación",
      });

    return next({
      context,
    });
  });
}

const devOnly = o.middleware(({ context, next }) => {
  if (env.NODE_ENV !== "development")
    throw new ORPCError("FORBIDDEN", {
      message: "Solo para desarrollo",
    });

  return next({
    context,
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);
export const rootOnlyProcedure = publicProcedure.use(rootOnly);
export const requireOrganizationProcedure =
  publicProcedure.use(requireOrganization);
export const devOnlyProcedure = publicProcedure.use(devOnly);
export function hasPermissionProcedure(permission: AppStatement) {
  return publicProcedure.use(hasPermission(permission));
}
