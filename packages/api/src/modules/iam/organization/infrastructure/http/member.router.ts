import { organizationContainer } from "@fludge/api/modules/iam/organization/container";
import { hasPermissionProcedure } from "@fludge/api/index";
import { addMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/add-member.command";
import { assignGroupsToMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/assign-groups-to-member.command";
import { removeGroupsFromMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/remove-groups-from-member.command";

const TAGS = ["Members"] as const;

export const memberRouter = {
  commands: {
    add: hasPermissionProcedure({
      members: ["create", "read"],
    })
      .route({
        method: "POST",
        path: "/organizations/members",
        tags: TAGS,
      })
      .input(addMemberCommand)
      .handler(({ input, context }) =>
        organizationContainer.commands.member.add.execute(
          context.session.user.id,
          context.session.activeOrganization,
          input,
        ),
      ),

    assignGroups: hasPermissionProcedure({
      members: ["assign_group"],
    })
      .route({
        method: "PUT",
        path: "/organizations/members/groups",
        tags: TAGS,
      })
      .input(assignGroupsToMemberCommand)
      .handler(({ input, context }) =>
        organizationContainer.commands.member.assignGroups.execute(
          context.session.user.id,
          context.session.activeOrganization,
          input,
        ),
      ),

    removeGroups: hasPermissionProcedure({
      members: ["assign_group"],
    })
      .route({
        method: "DELETE",
        path: "/organizations/members/groups",
        tags: TAGS,
      })
      .input(removeGroupsFromMemberCommand)
      .handler(({ input, context }) =>
        organizationContainer.commands.member.removeGroups.execute(
          context.session.activeOrganization,
          input,
        ),
      ),
  },

  queries: {
    findAll: hasPermissionProcedure({
      members: ["read"],
    })
      .route({
        method: "GET",
        path: "/organizations/members",
        tags: TAGS,
      })
      .handler(({ context }) =>
        organizationContainer.queries.members.findAll.execute(
          context.session.activeOrganization.id.toString(),
        ),
      ),
  },
};
