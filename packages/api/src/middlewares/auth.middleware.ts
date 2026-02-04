import { auth } from "@fludge/auth";
import { fromNodeHeaders } from "better-auth/node";
import { baseProcedure } from "..";

export const authMiddleware = baseProcedure.middleware(
  async ({ context, next }) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(context.req.headers),
    });

    return await next({
      context: {
        ...context,
        session,
      },
    });
  },
);
