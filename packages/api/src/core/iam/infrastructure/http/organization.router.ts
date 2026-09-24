import { hasPermissionProcedure, rootOnlyProcedure } from "@fludge/api/index";
import { registerOrganizationCommand } from "@fludge/api/core/iam/application/commands/register-organization.command";
import { updateOrganizationCommand } from "@fludge/api/core/iam/application/commands/update-organization.command";
import { iamContainer } from "@fludge/api/core/iam/container";

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
        iamContainer.commands.organization.register.execute(
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
        iamContainer.commands.organization.update.execute(
          context.session.authContext.organizationId.toString(),
          input,
        ),
      ),
  },
};
