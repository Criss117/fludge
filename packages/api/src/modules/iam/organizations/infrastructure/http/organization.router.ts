import { rootOnlyProcedure, withOrganization } from "@fludge/api/index";
import { organizationsContainer } from "@fludge/api/modules/iam/organizations/container";
import { registerOrganizationCommand } from "@fludge/api/modules/iam/organizations/application/commands/register-organization.command";
import { updateOrganizationCommand } from "@fludge/api/modules/iam/organizations/application/commands/update-organization.command";

export const organizationRouter = {
  commands: {
    register: rootOnlyProcedure
      .route({
        method: "POST",
        path: "/organizations/register",
        tags: ["organizations"],
      })
      .input(registerOrganizationCommand)
      .handler(({ input, context }) =>
        organizationsContainer.commands.register.execute(
          input,
          context.headers,
        ),
      ),

    update: withOrganization({
      onlyOwner: true,
    })
      .route({
        method: "PATCH",
        path: "/organizations/update",
        tags: ["organizations"],
      })
      .input(updateOrganizationCommand)
      .handler(({ input, context }) =>
        organizationsContainer.commands.update.execute(
          {
            ...input,
            organizationId: context.session.activeOrganization.id,
            memberId: context.session.member.id,
          },
          context.headers,
        ),
      ),
  },
  queries: {
    findByOwner: rootOnlyProcedure
      .route({
        method: "GET",
        path: "/organizations/find-by-owner",
        tags: ["organizations"],
      })
      .handler(({ context }) =>
        organizationsContainer.queries.findByOwner.execute({
          userId: context.session.user.id,
        }),
      ),
  },
} as const;
