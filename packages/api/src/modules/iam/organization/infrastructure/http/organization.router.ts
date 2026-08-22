import {
  protectedProcedure,
  requireOrganizationProcedure,
  rootOnlyProcedure,
} from "@fludge/api/index";
import { registerOrganizationCommand } from "@fludge/api/modules/iam/organization/application/commands/register-organization.commad";
import { organizationContainer } from "@fludge/api/modules/iam/organization/container";

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
        organizationContainer.commands.register.execute(
          context.session.user.id,
          input,
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
        organizationContainer.queries.findAll.execute(context.session.user.id),
      ),

    findActive: requireOrganizationProcedure
      .route({
        method: "GET",
        path: "/organizations/active",
        tags: TAGS,
      })
      .handler(({ context }) => context.session.activeOrganization.values),
  },
};
