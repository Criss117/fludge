import { and, eq } from "drizzle-orm";
import {
  hasAllPermissions,
  hasSomePermissions,
  type Permission,
} from "@fludge/utils/validators/permission.schemas";
import { db } from "@fludge/db";
import { withOrganizationMiddleware } from "./requiere-auth.middleware";
import { tryCatch } from "@fludge/utils/try-catch";
import { team, teamMember } from "@fludge/db/schema/organization";
import { InternalServerErrorException } from "../modules/shared/exceptions/internal-server-error.exception";
import { ForbiddenException } from "../modules/shared/exceptions/forbidden.exception";

type Options = {
  onlyRootUser?: boolean;
  permissions: Permission[];
  validateAllPermissions?: boolean;
};

export function withPermissionsMiddleware({
  permissions,
  onlyRootUser,
  validateAllPermissions = true,
}: Options) {
  return withOrganizationMiddleware({ onlyRootUser }).concat(
    async ({ context, next }) => {
      if (context.session.user.isRoot)
        return next({
          context,
        });

      const { data: teams, error: teamsError } = await tryCatch(
        db
          .select({
            permissions: team.permissions,
          })
          .from(teamMember)
          .innerJoin(team, eq(teamMember.teamId, team.id))
          .where(
            and(
              eq(teamMember.organizationId, context.organization.id),
              eq(teamMember.userId, context.session.user.id),
            ),
          ),
      );

      if (teamsError) throw new InternalServerErrorException();

      if (!teams.length)
        throw new ForbiddenException(
          "No tienes permitido acceder a este recurso",
        );

      const allPermission = Array.from(
        new Set(teams.flatMap((t) => t.permissions)),
      );

      const hasPermissions = validateAllPermissions
        ? hasAllPermissions(allPermission, permissions)
        : hasSomePermissions(allPermission, permissions);

      if (!hasPermissions)
        throw new ForbiddenException(
          "No tienes permitido acceder a este recurso",
        );

      return next({
        context,
      });
    },
  );
}
