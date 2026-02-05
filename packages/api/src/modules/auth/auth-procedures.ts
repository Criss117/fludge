import { baseProcedure } from "@fludge/api";
import { authMiddleware } from "@fludge/api/middlewares/auth.middleware";
import { auth } from "@fludge/auth";
import { signUpSchema } from "@fludge/utils/validators/auth.schemas";

export const authProcedures = {
  getSession: baseProcedure.use(authMiddleware).handler(async ({ context }) => {
    if (!context.session) return null;

    const orgs = await auth.api.listOrganizations({
      headers: context.req.headers,
    });

    return {
      session: context.session.session,
      user: context.session.user,
      orgs,
    };
  }),
  signUp: {
    root: baseProcedure.input(signUpSchema).handler(({ input }) => {
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
