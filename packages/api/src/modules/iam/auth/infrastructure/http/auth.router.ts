import { protectedProcedure } from "@fludge/api/index";
import { setActiveOrganizationCommand } from "@fludge/api/modules/iam/auth/application/commands/set-active-organization.command";
import { authContainer } from "@fludge/api/modules/iam/auth/container";

export const authRouter = {
  commands: {
    setActiveOrganization: protectedProcedure
      .route({
        method: "POST",
        path: "/auth/set-active-organization",
        tags: ["Auth"],
      })
      .input(setActiveOrganizationCommand)
      .handler(({ input, context }) =>
        authContainer.commands.setActiveOrganization.execute({
          organizationId: input.organizationId,
          loggedUserId: context.session.user.id,
          sessionId: context.session.id,
        }),
      ),
  },
};
