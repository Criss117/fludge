import { hasPermissionProcedure } from "@fludge/api/index";
import { addMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/add-member.command";
import { organizationContainer } from "../../container";
import { assignGroupsToMemberCommand } from "../../application/commands/assign-groups-to-member.command";

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
      groupMembers: ["assign", "read"],
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
  },
};
