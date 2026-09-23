import { hasPermissionProcedure } from "@fludge/api/index";
import { assignGroupsToMemberCommand } from "@core/iam/application/commands/assign-groups-to-member.command";
import { removeGroupsFromMemberCommand } from "@core/iam/application/commands/remove-groups-from-member.command";
import { organizationContainer } from "@core/iam/container";

const TAGS = ["Members"] as const;

export const memberRouter = {
  commands: {
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
          context.session.authContext,
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
          context.session.authContext,
          input,
        ),
      ),
  },
};