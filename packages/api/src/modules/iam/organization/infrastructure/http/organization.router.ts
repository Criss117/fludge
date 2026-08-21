import { protectedProcedure, rootOnlyProcedure } from "@fludge/api/index";
import { registerOrganizationCommand } from "../../application/commands/register-organization.commad";
import { organizationContainer } from "../../container";
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
    finAll: protectedProcedure
      .route({
        method: "GET",
        path: "/organizations",
        tags: TAGS,
      })
      .handler(({ context }) =>
        organizationContainer.queries.findAll.execute(context.session.user.id),
      ),
  },
};
