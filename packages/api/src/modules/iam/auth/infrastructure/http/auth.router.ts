import { publicProcedure } from "@fludge/api/index";
import { signUpEmailCommand } from "@fludge/api/modules/iam/auth/application/commands/sign-up.command";
import { authContainer } from "@fludge/api/modules/iam/auth/container";

export const authRouter = {
  commands: {
    signUpEmail: publicProcedure
      .route({
        method: "POST",
        path: "/auth/sign-up-email",
        tags: ["auth"],
      })
      .input(signUpEmailCommand)
      .handler(({ input, context }) =>
        authContainer.commands.signUpEmail.execute(input, context.headers),
      ),
  },
  queries: {
    getSession: publicProcedure
      .route({
        method: "GET",
        path: "/auth/session",
        tags: ["auth"],
      })
      .handler(({ context }) => context.session),
  },
} as const;
