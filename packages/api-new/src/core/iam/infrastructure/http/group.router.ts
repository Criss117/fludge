import { hasPermissionProcedure } from "@fludge/api/index";
import { createGroupCommand } from "@core/iam/application/commands/create-group.command";
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
  },
};
