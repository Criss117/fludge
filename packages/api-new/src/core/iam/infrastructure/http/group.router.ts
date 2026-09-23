import { hasPermissionProcedure } from "@fludge/api/index";
import { createGroupCommand } from "@core/iam/application/commands/create-group.command";
import { deleteGroupsCommand } from "@core/iam/application/commands/delete-groups.command";
import { updateGroupCommand } from "@core/iam/application/commands/update-group.command";
import { organizationContainer } from "@core/iam/container";

const TAGS = ["Groups"] as const;

export const groupRouter = {
  commands: {
    create: hasPermissionProcedure({
      groups: ["create", "read"],
    })
      .route({
        method: "POST",
        path: "/organizations/groups",
        tags: TAGS,
      })
      .input(createGroupCommand)
      .handler(({ input, context }) =>
        organizationContainer.commands.group.create.execute(
          context.session.authContext,
          input,
        ),
      ),

    update: hasPermissionProcedure({
      groups: ["update", "read"],
    })
      .route({
        method: "PUT",
        path: "/organizations/groups",
        tags: TAGS,
      })
      .input(updateGroupCommand)
      .handler(({ input, context }) =>
        organizationContainer.commands.group.update.execute(
          context.session.authContext,
          input,
        ),
      ),

    delete: hasPermissionProcedure({
      groups: ["delete", "read"],
    })
      .route({
        method: "DELETE",
        path: "/organizations/groups",
        tags: TAGS,
      })
      .input(deleteGroupsCommand)
      .handler(({ input, context }) =>
        organizationContainer.commands.group.delete.execute(
          context.session.authContext,
          input,
        ),
      ),
  },
};
