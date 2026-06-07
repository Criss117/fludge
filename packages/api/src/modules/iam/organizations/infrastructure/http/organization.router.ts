import {
  protectedProcedure,
  rootOnlyProcedure,
  withOrganization,
} from "@fludge/api/index";
import { organizationsContainer } from "@fludge/api/modules/iam/organizations/container";
import { registerOrganizationCommand } from "@fludge/api/modules/iam/organizations/application/commands/register-organization.command";
import { updateOrganizationCommand } from "@fludge/api/modules/iam/organizations/application/commands/update-organization.command";

const TAGS = ["Organizations"] as const;

export const organizationRouter = {
  commands: {
    register: rootOnlyProcedure
      .route({
        method: "POST",
        path: "/organizations",
        tags: TAGS,
      })
      .input(registerOrganizationCommand)
      .handler(({ input, context }) =>
        organizationsContainer.commands.register.execute(
          {
            ...input,
            registeredBy: {
              email: context.session.user.email,
              name: context.session.user.name,
              userId: context.session.user.id,
            },
          },
          context.headers,
        ),
      ),

    update: withOrganization({
      onlyOwner: true,
    })
      .route({
        method: "PATCH",
        path: "/organizations",
        tags: TAGS,
      })
      .input(updateOrganizationCommand)
      .handler(({ input, context }) =>
        organizationsContainer.commands.update.execute(
          {
            ...input,
            organizationId: context.session.activeOrganization.id,
            changesBy: {
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
    findAll: protectedProcedure
      .route({
        method: "GET",
        path: "/organizations",
        tags: TAGS,
      })
      .handler(({ context }) =>
        organizationsContainer.queries.findAll.execute({
          userId: context.session.user.id,
        }),
      ),

    findActive: protectedProcedure
      .route({
        method: "GET",
        path: "/organizations/active",
        tags: TAGS,
      })
      .handler(({ context }) =>
        organizationsContainer.queries.findActive.execute(context.headers),
      ),
  },
} as const;
