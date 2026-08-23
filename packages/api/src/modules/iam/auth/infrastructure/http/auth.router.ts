import { hasPermissionProcedure, protectedProcedure } from "@fludge/api/index";
import { setActiveOrganizationCommand } from "@fludge/api/modules/iam/auth/application/commands/set-active-organization.command";
import { authContainer } from "@fludge/api/modules/iam/auth/container";
import { signUpMemberCommand } from "@fludge/api/modules/iam/auth/application/commands/sign-up-member.command";

const TAGS = ["Auth"] as const;

export const authRouter = {
  commands: {
    setActiveOrganization: protectedProcedure
      .route({
        method: "POST",
        path: "/auth/set-active-organization",
        tags: TAGS,
      })
      .input(setActiveOrganizationCommand)
      .handler(({ input, context }) =>
        authContainer.commands.setActiveOrganization.execute({
          organizationId: input.organizationId,
          loggedUserId: context.session.user.id,
          sessionId: context.session.id,
        }),
      ),

    signUpMember: hasPermissionProcedure({
      members: ["create"],
    })
      .route({
        method: "POST",
        path: "/auth/sign-up-member",
        tags: TAGS,
      })
      .input(signUpMemberCommand)
      .handler(({ input, context }) =>
        authContainer.commands.signUpMember.execute(
          context.headers,
          context.session.user.id,
          context.session.activeOrganization,
          input,
        ),
      ),
  },
};
