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
            user: {
              name: context.session.user.name,
              id: context.session.user.id,
            },
          },
          context.headers,
        ),
      ),
  },
  queries: {
    findActive: withOrganization()
      .route({
        method: "GET",
        path: "/organizations/active",
        tags: ["organizations"],
      })
      .handler(({ context }) => context.session.activeOrganization),
  },
} as const;
