import { withOrganization } from "@fludge/api/index";
import { signUpMemberCommand } from "@fludge/api/modules/iam/members/application/commands/sign-up-member.command";
import { membersContainer } from "@fludge/api/modules/iam/members/container";
import { assignGroupsToMemberCommand } from "@fludge/api/modules/iam/members/application/commands/assign-groups-to-member.command";
import { unassignGroupsOfMemberCommand } from "@fludge/api/modules/iam/members/application/commands/unassign-groups-of-member.command";

export const memberRouter = {
  commands: {
    create: withOrganization({
      requirePermission: "members:create",
    })
      .route({
        method: "POST",
        path: "/members",
        tags: ["members"],
      })
      .input(signUpMemberCommand)
      .handler(({ input, context }) =>
        membersContainer.commands.signUpMember.execute(
          {
            ...input,
            organizationId: context.session.activeOrganization.id,
            assignedByMemberId: context.session.member.id,
          },
          context.headers,
        ),
      ),

    assignGroups: withOrganization({
      requirePermission: "members:assign-group",
    })
      .route({
        method: "POST",
        path: "/members/groups",
        tags: ["members"],
      })
      .input(assignGroupsToMemberCommand)
      .handler(({ input, context }) =>
        membersContainer.commands.assignGroups.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          changedByMemberId: context.session.member.id,
        }),
      ),

    unassignGroups: withOrganization({
      requirePermission: "members:assign-group",
    })
      .route({
        method: "DELETE",
        path: "/members/groups",
        tags: ["members"],
      })
      .input(unassignGroupsOfMemberCommand)
      .handler(({ input, context }) =>
        membersContainer.commands.unassignGroups.execute({
          ...input,
          organizationId: context.session.activeOrganization.id,
          changedByMemberId: context.session.member.id,
        }),
      ),
  },
  queries: {
    findAll: withOrganization({
      requirePermission: "members:view",
    })
      .route({
        method: "GET",
        path: "/members",
        tags: ["members"],
      })
      .handler(({ context }) =>
        membersContainer.queries.findAll.execute({
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
} as const;
