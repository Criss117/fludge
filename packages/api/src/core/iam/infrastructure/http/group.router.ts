import { assignMembersToGroupCommand } from "@fludge/api/core/iam/application/commands/assign-members-to-group.command";
import { createGroupCommand } from "@fludge/api/core/iam/application/commands/create-group.command";
import { deleteGroupsCommand } from "@fludge/api/core/iam/application/commands/delete-groups.command";
import { removeMembersFromGroupCommand } from "@fludge/api/core/iam/application/commands/remove-members-from-group.command";
import { updateGroupCommand } from "@fludge/api/core/iam/application/commands/update-group.command";
import { iamContainer } from "@fludge/api/core/iam/container";
import { hasPermissionProcedure } from "@fludge/api/index";

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
        iamContainer.commands.group.create.execute(
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
        iamContainer.commands.group.update.execute(
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
        iamContainer.commands.group.delete.execute(
          context.session.authContext,
          input,
        ),
      ),

    assignMembers: hasPermissionProcedure({
      groups: ["assign_member"],
    })
      .route({
        method: "PUT",
        path: "/organizations/groups/members",
        tags: TAGS,
      })
      .input(assignMembersToGroupCommand)
      .handler(({ input, context }) =>
        iamContainer.commands.group.assignMembers.execute(
          context.session.authContext,
          input,
        ),
      ),

    removeMembers: hasPermissionProcedure({
      groups: ["assign_member"],
    })
      .route({
        method: "DELETE",
        path: "/organizations/groups/members",
        tags: TAGS,
      })
      .input(removeMembersFromGroupCommand)
      .handler(({ input, context }) =>
        iamContainer.commands.group.removeMembers.execute(
          context.session.authContext,
          input,
        ),
      ),
  },
};
