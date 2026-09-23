import { hasPermissionProcedure, rootOnlyProcedure } from "@fludge/api/index";
import { registerOrganizationCommand } from "../../../iam/application/commands/register-organization.command";
import { updateOrganizationCommand } from "../../../iam/application/commands/update-organization.command";
import { organizationContainer } from "../../../iam/container";

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

    update: hasPermissionProcedure({
      organizations: ["update"],
    })
      .route({
        method: "PUT",
        path: "/organizations",
        tags: TAGS,
      })
      .input(updateOrganizationCommand)
      .handler(({ input, context }) =>
        organizationContainer.commands.update.execute(
          context.session.authContext.organizationId.toString(),
          input,
        ),
      ),
  },
};