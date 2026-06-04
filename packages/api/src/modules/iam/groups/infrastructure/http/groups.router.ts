import { withOrganization } from "@fludge/api/index";
import { groupsContainer } from "@fludge/api/modules/iam/groups/container";

import { createGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/create-group.command";
import { updateGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/update-group.command";
import { deleteGroupsCommand } from "@fludge/api/modules/iam/groups/application/commands/delete-groups.command";
import { activateGroupsCommand } from "@fludge/api/modules/iam/groups/application/commands/activate-groups.command";
import { deactivateGroupsCommand } from "@fludge/api/modules/iam/groups/application/commands/deactivate-groups.command";
import { assignMembersToGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/assign-members-to-group.command";
import { unassignMembersOfGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/unassign-members-of-group.command";

export const groupsRouter = {
  commands: {
    create: withOrganization({
      requirePermission: "groups:create",
    })
      .route({
        method: "POST",
        path: "/groups",
        tags: ["groups"],
      })
      .input(createGroupCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.create.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          changedByMemberId: context.session.member.id,
        }),
      ),

    update: withOrganization({
      requirePermission: "groups:update",
    })
      .route({
        method: "PATCH",
        path: "/groups",
        tags: ["groups"],
      })
      .input(updateGroupCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.update.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          changedByMemberId: context.session.member.id,
        }),
      ),

    delete: withOrganization({
      requirePermission: "groups:delete",
    })
      .route({
        method: "DELETE",
        path: "/groups",
        tags: ["groups"],
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
        tags: ["groups"],
      })
      .input(activateGroupsCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.activate.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          changedByMemberId: context.session.member.id,
        }),
      ),

    deactivate: withOrganization({
      requirePermission: "groups:update",
    })
      .route({
        method: "PATCH",
        path: "/groups/deactivate",
        tags: ["groups"],
      })
      .input(deactivateGroupsCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.deactivate.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          changedByMemberId: context.session.member.id,
        }),
      ),

    assignMembers: withOrganization({
      requirePermission: "groups:assign-member",
    })
      .route({
        method: "POST",
        path: "/groups/members",
        tags: ["groups"],
      })
      .input(assignMembersToGroupCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.assignMembers.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          changedByMemberId: context.session.member.id,
        }),
      ),

    unassignMembers: withOrganization({
      requirePermission: "groups:assign-member",
    })
      .route({
        method: "DELETE",
        path: "/groups/members",
        tags: ["groups"],
      })
      .input(unassignMembersOfGroupCommand)
      .handler(({ input, context }) =>
        groupsContainer.commands.unassignMembers.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          changedByMemberId: context.session.member.id,
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
        tags: ["groups"],
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
        tags: ["groups"],
      })
      .handler(({ context }) =>
        groupsContainer.queries.findAll.execute({
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
} as const;
