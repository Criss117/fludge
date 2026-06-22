import { withOrganization } from "@fludge/api/index";
import { membersContainer } from "@fludge/api/modules/iam/members/container";
import { registerMemberCommand } from "@fludge/api/modules/iam/members/application/commands/register-member.command";

const TAGS = ["Members"] as const;

export const memberRouter = {
  commands: {
    register: withOrganization({
      requirePermission: "members:create",
    })
      .route({
        method: "POST",
        path: "/members",
        tags: TAGS,
      })
      .input(registerMemberCommand)
      .handler(({ input, context }) =>
        membersContainer.commands.register.execute(
          {
            ...input,
            organizationId: context.session.activeOrganization.id,
            assignedBy: {
              memberId: context.session.member.id,
              name: context.session.user.name,
              email: context.session.user.email,
            },
          },
          context.headers,
        ),
      ),
  },
  queries: {
    me: withOrganization({
      resolveOnly: true,
    })
      .route({
        method: "GET",
        path: "/members/me",
        tags: TAGS,
      })
      .handler(({ context }) =>
        membersContainer.queries.me.execute({
          memberId: context.session.member.id,
        }),
      ),

    findAll: withOrganization({
      requirePermission: "members:view",
    })
      .route({
        method: "GET",
        path: "/members",
        tags: TAGS,
      })
      .handler(({ context }) =>
        membersContainer.queries.findAll.execute({
          organizationId: context.session.activeOrganization.id,
        }),
      ),
  },
} as const;
