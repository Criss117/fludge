import { hasPermissionProcedure } from "@fludge/api/index";
import { createGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/create-group.command";
import { organizationContainer } from "@fludge/api/modules/iam/organization/container";
import { updateGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/update-group.command";
import { assignMembersToGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/assign-members-to-group.command";
import { deleteGroupsCommand } from "@fludge/api/modules/iam/organization/application/commands/delete-groups.command";

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
          context.session.user.id,
          context.session.activeOrganization,
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
          context.session.activeOrganization,
          input,
        ),
      ),

    assingMembers: hasPermissionProcedure({
      groupMembers: ["assign", "read"],
    })
      .route({
        method: "PUT",
        path: "/organizations/groups/members",
        tags: TAGS,
      })
      .input(assignMembersToGroupCommand)
      .handler(({ input, context }) =>
        organizationContainer.commands.group.assignMembers.execute(
          context.session.user.id,
          context.session.activeOrganization,
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
          context.session.activeOrganization,
          input,
        ),
      ),
  },
};
