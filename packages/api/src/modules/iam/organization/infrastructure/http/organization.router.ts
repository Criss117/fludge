import { rootOnlyProcedure } from "@fludge/api/index";
import { registerOrganizationCommand } from "../../application/commands/register-organization.commad";
import { organizationContainer } from "../../container";
const TAGS = ["Organizations"] as const;

export const organizationRouter = {
  commands: {
    register: rootOnlyProcedure
      .route({
        method: "POST",
        path: "/organizations",
        tags: TAGS,
      })
      .input(registerOrganizationCommand)
      .handler(({ input, context }) =>
        organizationContainer.commands.register.execute(
          context.session.user.id,
          input,
        ),
      ),
  },
};
