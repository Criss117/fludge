import { hasPermissionProcedure } from "@fludge/api/index";
import { createGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/create-group.command";
import { organizationContainer } from "@fludge/api/modules/iam/organization/container";
import { updateGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/update-group.command";

const TAGS = ["Groups"] as const;

export const groupRouter = {
  commands: {
    create: hasPermissionProcedure({
      groups: ["create"],
    })
      .route({
        method: "POST",
        path: "/organizations/groups",
        tags: TAGS,
      })
      .input(createGroupCommand)
      .handler(({ input, context }) =>
        organizationContainer.commands.group.create.execute(
          context.session.user.id,
          context.session.activeOrganization,
          input,
        ),
      ),

    update: hasPermissionProcedure({
      groups: ["update"],
    })
      .route({
        method: "PUT",
        path: "/organizations/groups",
        tags: TAGS,
      })
      .input(updateGroupCommand)
      .handler(({ input, context }) =>
        organizationContainer.commands.group.update.execute(
          context.session.activeOrganization,
          input,
        ),
      ),
  },
};
