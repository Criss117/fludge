import { withOrganization } from "@fludge/api/index";
import { groupsContainer } from "@fludge/api/modules/iam/groups/container";
import { createGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/create-group.command";

export const groupsRouter = {
  commands: {
    create: withOrganization({
      requirePermission: "groups:create",
    })
      .route({
        method: "POST",
        path: "/groups/create",
        tags: ["groups"],
      })
      .input(createGroupCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.createGroup.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
  queries: {},
} as const;
