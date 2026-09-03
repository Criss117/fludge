import { os } from "@orpc/server";

import type { Context } from "./context";
import { organizationContainer } from "./modules/iam/organization/container";
import { UUID } from "@fludge/utils/uuid";
import { env } from "@fludge/env/server";
import type { PermissionsRecord } from "@fludge/utils/permissions/data";
import {
  ForbiddenError,
  InternalServerError,
  UnauthorizedError,
} from "./modules/shared/domain/exceptions/base-exception";
import { OrganizationNotFoundException } from "./modules/iam/organization/domain/exceptions/organization-not-found.exception";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session)
    throw new UnauthorizedError("auth.sessions.errors.unauthorized");

  return next({
    context: {
      session: context.session,
    },
  });
});

const rootOnly = requireAuth.concat(({ context, next }) => {
  if (!context.session.user.isRoot)
    throw new ForbiddenError("auth.users.errors.not_root");

  return next({
    context: {
      session: context.session,
    },
  });
});

const requireOrganization = requireAuth.concat(async ({ context, next }) => {
  const activeOrganizationId = context.session.activeOrganizationId;

  if (!activeOrganizationId)
    throw new ForbiddenError("auth.sessions.errors.no_active_organization");

  const [organization, errOrganization] =
    await organizationContainer.repositories.organizationRepository.findOneById(
      context.session.user.id,
      activeOrganizationId,
    );

  if (errOrganization)
    throw new InternalServerError(
      errOrganization,
      "iam.organizations.errors.isr_on_find",
    );

  if (!organization) throw new OrganizationNotFoundException();

  const loggedUserIsMember = organization.members.getMemberByUserId(
    UUID.fromString(context.session.user.id),
  );

  if (!loggedUserIsMember)
    throw new ForbiddenError("iam.members.errors.not_member");

  if (loggedUserIsMember.status.isInactive())
    throw new ForbiddenError("iam.members.errors.without_permissions");

  return next({
    context: {
      session: { ...context.session, activeOrganization: organization },
    },
  });
});

function hasPermission(required: PermissionsRecord) {
  return requireOrganization.concat(({ context, next }) => {
    const userMember =
      context.session.activeOrganization.members.getMemberByUserId(
        UUID.fromString(context.session.user.id),
      );

    if (!userMember) throw new ForbiddenError("iam.members.errors.not_member");

    const hasPermissions =
      context.session.activeOrganization.memberHasPermission(
        userMember.id,
        required,
      );

    if (!hasPermissions)
      throw new ForbiddenError("iam.members.errors.without_permissions");

    return next({
      context,
    });
  });
}

const devOnly = o.middleware(({ context, next }) => {
  if (env.NODE_ENV !== "development")
    throw new ForbiddenError("auth.users.errors.only_dev");

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
