import { rootOnlyProcedure } from "@fludge/api/index";
import { organizationsContainer } from "@fludge/api/modules/iam/organizations/container";
import { registerOrganizationCommand } from "@fludge/api/modules/iam/organizations/application/commands/register-organization.command";

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
        organizationsContainer.commands.registerOrganization.execute(
          context.session.user.id,
          input,
        ),
      ),
  },
  queries: {},
} as const;
