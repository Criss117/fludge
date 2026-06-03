import { withOrganization } from "@fludge/api/index";
import { groupsContainer } from "@fludge/api/modules/iam/groups/container";
import { createGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/create-group.command";
import { updateGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/update-group.command";

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
        groupsContainer.commands.create.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          memberId: context.session.member.id,
        }),
      ),

    update: withOrganization({
      requirePermission: "groups:update",
    })
      .route({
        method: "PATCH",
        path: "/groups/update",
        tags: ["groups"],
      })
      .input(updateGroupCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.update.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          memberId: context.session.member.id,
        }),
      ),
  },
  queries: {},
} as const;
