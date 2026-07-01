import { withOrganization } from "@fludge/api/index";
import { groupsContainer } from "@fludge/api/modules/iam/groups/container";

import { createGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/create-group.command";
import { updateGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/update-group.command";
import { deleteGroupsCommand } from "@fludge/api/modules/iam/groups/application/commands/delete-groups.command";
import { activateGroupsCommand } from "@fludge/api/modules/iam/groups/application/commands/activate-groups.command";
import { deactivateGroupsCommand } from "@fludge/api/modules/iam/groups/application/commands/deactivate-groups.command";

const TAGS = ["Groups"] as const;

export const groupsRouter = {
  commands: {
    create: withOrganization({
      requirePermission: "groups:create",
    })
      .route({
        method: "POST",
        path: "/groups",
        tags: TAGS,
      })
      .input(createGroupCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.create.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          createdBy: {
            memberId: context.session.member.id,
          },
        }),
      ),

    update: withOrganization({
      requirePermission: "groups:update",
    })
      .route({
        method: "PATCH",
        path: "/groups",
        tags: TAGS,
      })
      .input(updateGroupCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.update.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          updatedBy: {
            memberId: context.session.member.id,
          },
        }),
      ),

    delete: withOrganization({
      requirePermission: "groups:delete",
    })
      .route({
        method: "DELETE",
        path: "/groups",
        tags: TAGS,
      })
      .input(deleteGroupsCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.delete.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
        }),
      ),

    activate: withOrganization({
      requirePermission: "groups:update",
    })
      .route({
        method: "PATCH",
        path: "/groups/activate",
        tags: TAGS,
      })
      .input(activateGroupsCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.activate.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
        }),
      ),

    deactivate: withOrganization({
      requirePermission: "groups:update",
    })
      .route({
        method: "PATCH",
        path: "/groups/deactivate",
        tags: TAGS,
      })
      .input(deactivateGroupsCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.deactivate.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
  queries: {
    findAllByMember: withOrganization({
      requirePermission: "groups:view",
    })
      .route({
        method: "GET",
        path: "/groups/by-member",
        tags: TAGS,
      })
      .handler(({ context }) =>
        groupsContainer.queries.findAllByMember.execute({
          memberId: context.session.member.id,
        }),
      ),

    findAll: withOrganization({
      requirePermission: "groups:view",
    })
      .route({
        method: "GET",
        path: "/groups",
        tags: TAGS,
      })
      .handler(({ context }) =>
        groupsContainer.queries.findAll.execute({
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
} as const;
