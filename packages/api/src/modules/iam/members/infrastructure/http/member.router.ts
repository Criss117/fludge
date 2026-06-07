import { withOrganization } from "@fludge/api/index";
import { signUpMemberCommand } from "@fludge/api/modules/iam/members/application/commands/sign-up-member.command";
import { membersContainer } from "@fludge/api/modules/iam/members/container";

const TAGS = ["Members"] as const;

export const memberRouter = {
  commands: {
    create: withOrganization({
      requirePermission: "members:create",
    })
      .route({
        method: "POST",
        path: "/members",
        tags: TAGS,
      })
      .input(signUpMemberCommand)
      .handler(({ input, context }) =>
        membersContainer.commands.signUpMember.execute(
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
