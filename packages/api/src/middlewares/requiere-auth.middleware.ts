import { and, eq } from "drizzle-orm";
import { db } from "@fludge/db";
import { tryCatch } from "@fludge/utils/try-catch";
import { member, organization } from "@fludge/db/schema/organization";

import { authMiddleware } from "./auth.middleware";
import { AnyOrganizationException } from "../modules/organizations/exceptions/any-organization-active.exception";
import { InternalServerErrorException } from "../modules/shared/exceptions/internal-server-error.exception";
import { UnauthorizedException } from "../modules/shared/exceptions/unauthorized.exception";
import { ForbiddenException } from "../modules/shared/exceptions/forbidden.exception";

type Options = {
  onlyRootUser?: boolean;
};

export function requireAuthMiddleware(options?: Options) {
  return authMiddleware.concat(async ({ context, next }) => {
    if (!context.session) throw new UnauthorizedException();

    if (options?.onlyRootUser && !context.session.user.isRoot)
      throw new ForbiddenException();

    return await next({
      context: {
        ...context,
        session: context.session,
      },
    });
  });
}

export function withOrganizationMiddleware(options?: Options) {
  return requireAuthMiddleware(options).concat(async ({ context, next }) => {
    const activeOrganizationId = context.session.activeOrganizationId;

    if (!activeOrganizationId) throw new AnyOrganizationException();

    const { data: selectedOrganizations, error: selectedOrganizationsError } =
      await tryCatch(
        db
          .select()
          .from(organization)
          .where(eq(organization.id, activeOrganizationId))
          .limit(1),
      );

    if (selectedOrganizationsError)
      throw new InternalServerErrorException(
        selectedOrganizationsError.message,
      );

    const selectedOrganization = selectedOrganizations.at(0);

    if (!selectedOrganization) throw new AnyOrganizationException();

    const loggedUserIsRoot =
      selectedOrganization.rootUserId === context.session.user.id;

    if (options?.onlyRootUser && !loggedUserIsRoot)
      throw new ForbiddenException("No puedes realizar esta acción");

    if (loggedUserIsRoot)
      return await next({
        context: {
          ...context,
          session: context.session,
          organization: selectedOrganization,
        },
      });

    const { data: membersInOrg, error: memberInOrgError } = await tryCatch(
      db
        .select()
        .from(member)
        .where(
          and(
            eq(member.organizationId, selectedOrganization.id),
            eq(member.userId, context.session.user.id),
          ),
        )
        .limit(1),
    );

    if (memberInOrgError)
      throw new InternalServerErrorException(memberInOrgError.message);

    const memberInOrg = membersInOrg.at(0);

    if (!memberInOrg)
      throw new UnauthorizedException("No pertenece a esta organización");

    return next({
      context: {
        ...context,
        session: context.session,
        organization: selectedOrganization,
      },
    });
  });
}
