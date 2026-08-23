import { hasPermissionProcedure } from "@fludge/api/index";
import { createGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/create-group.command";
import { organizationContainer } from "../../container";

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
  },
};
