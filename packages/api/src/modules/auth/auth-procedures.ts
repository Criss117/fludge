import { fromNodeHeaders } from "better-auth/node";
import { baseProcedure } from "@fludge/api";
import { authMiddleware } from "@fludge/api/middlewares/auth.middleware";
import { auth } from "@fludge/auth";
import { signUpSchema } from "@fludge/utils/validators/auth.schemas";

export const authProcedures = {
  getSession: baseProcedure({
    method: "GET",
    description: "Get the current session",
    tags: ["Auth"],
  })
    .use(authMiddleware)
    .handler(async ({ context }) => {
      if (!context.session) return null;

      const orgs = await auth.api.listOrganizations({
        headers: fromNodeHeaders(context.req.headers),
      });

      return {
        ...context.session,
        organizations: orgs,
      };
    }),
  signUp: {
    root: baseProcedure({
      tags: ["Auth"],
    })
      .input(signUpSchema)
      .handler(({ input }) => {
        return auth.api.signUpEmail({
          body: {
            email: input.email,
            name: input.name,
            password: input.password,
            isRoot: true,
          },
        });
      }),
  },
};
