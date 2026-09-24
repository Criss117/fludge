import { hasPermissionProcedure, protectedProcedure } from "@fludge/api/index";
import { signUpMemberCommand } from "@fludge/api/core/auth/application/commands/sign-up-member.command";
import { updateUserInfoCommand } from "@fludge/api/core/auth/application/commands/update-user-info.command";
import { authContainer } from "@fludge/api/core/auth/container";

const TAGS = ["Auth"] as const;

export const authRouter = {
  commands: {
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
          context.session.authContext,
          input,
        ),
      ),

    updateUserInfo: protectedProcedure
      .route({
        method: "PUT",
        path: "/auth/update-user-info",
        tags: TAGS,
      })
      .input(updateUserInfoCommand)
      .handler(({ input, context }) =>
        authContainer.commands.updateUserInfo.execute(context.headers, input),
      ),
  },
} as const;
