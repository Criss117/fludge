import { hasPermissionProcedure } from "@fludge/api/index";
import { addMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/add-member.command";
import { organizationContainer } from "../../container";

const TAGS = ["Members"] as const;

export const memberRouter = {
  commands: {
    add: hasPermissionProcedure({
      members: ["create"],
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
  },
};
