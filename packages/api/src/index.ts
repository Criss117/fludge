import { os } from "@orpc/server";
import type { Context } from "./context";
import { organizationContainer } from "./core/iam/container";
import {
  ForbiddenError,
  InternalServerError,
  UnauthorizedError,
} from "./core/shared/exceptions/base-exception";
import type { PermissionsRecord } from "@fludge/utils/permissions/data";
import { env } from "@fludge/env/server";

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

const requireOrganization = requireAuth.concat(async ({ context, next }) => {
  const activeOrganizationId = context.session.activeOrganizationId;

  if (!activeOrganizationId)
    throw new ForbiddenError("api_errors.auth.sessions.no_active_organization");

  const [authContext, errAuthContext] =
    await organizationContainer.services.userAuthContextService.build(
      context.session.user.id,
      activeOrganizationId,
    );

  if (errAuthContext)
    throw new InternalServerError(
      errAuthContext,
      "api_errors.iam.organizations.isr_on_find",
    );

  if (!authContext)
    throw new ForbiddenError("api_errors.iam.members.not_member");

  if (authContext.member.status.isInactive())
    throw new ForbiddenError("api_errors.iam.members.without_permissions");

  return next({
    context: {
      session: { ...context.session, authContext },
    },
  });
});

function hasPermission(required: PermissionsRecord) {
  return requireOrganization.concat(({ context, next }) => {
    const hasPermissions = context.session.authContext.hasPermission(required);

    if (!hasPermissions)
      throw new ForbiddenError("api_errors.iam.members.without_permissions");

    return next({
      context,
    });
  });
}

const devOnly = o.middleware(({ context, next }) => {
  if (env.NODE_ENV !== "development")
    throw new ForbiddenError("api_errors.auth.users.only_dev");

  return next({
    context,
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);
export const rootOnlyProcedure = publicProcedure.use(rootOnly);
export const requireOrganizationProcedure =
  publicProcedure.use(requireOrganization);
export const devOnlyProcedure = publicProcedure.use(devOnly);
export function hasPermissionProcedure(permission: PermissionsRecord) {
  return publicProcedure.use(hasPermission(permission));
}