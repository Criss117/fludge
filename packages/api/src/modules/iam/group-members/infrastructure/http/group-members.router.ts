import { withOrganization } from "@fludge/api/index";
import { groupMembersContainer } from "@fludge/api/modules/iam/group-members/container";
import { assignMembersCommand } from "@fludge/api/modules/iam/group-members/application/commands/assign-members.command";
import { unassignMembersCommand } from "@fludge/api/modules/iam/group-members/application/commands/unassign-members.command";

const TAGS = ["Group Members"] as const;

export const groupMembersRouter = {
  commands: {
    assignMembers: withOrganization({
      requirePermission: ["groups:assign-member", "members:assign-group"],
      mode: "any",
    })
      .route({
        method: "POST",
        path: "/group-members/assign",
        tags: TAGS,
      })
      .input(assignMembersCommand)
      .handler(({ input, context }) =>
        groupMembersContainer.commands.assignMembers.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          assignedBy: {
            memberId: context.session.member.id,
            name: context.session.user.name,
            email: context.session.user.email,
          },
        }),
      ),

    unassignMembers: withOrganization({
      requirePermission: ["groups:assign-member", "members:assign-group"],
      mode: "any",
    })
      .route({
        method: "DELETE",
        path: "/group-members/unassign",
        tags: TAGS,
      })
      .input(unassignMembersCommand)
      .handler(({ input, context }) =>
        groupMembersContainer.commands.unassignMembers.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
  queries: {
    findAll: withOrganization({
      requirePermission: ["groups:view", "members:view"],
      mode: "any",
    })
      .route({
        path: "/group-members",
        method: "GET",
        tags: TAGS,
      })
      .handler(({ context }) =>
        groupMembersContainer.queries.findAll.execute({
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
} as const;
