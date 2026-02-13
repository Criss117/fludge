import { auth } from "@fludge/auth";
import { fromNodeHeaders } from "better-auth/node";
import { baseRouter } from "..";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "../modules/shared/exceptions/internal-server-error.exception";

export const authMiddleware = baseRouter.middleware(
  async ({ context, next }) => {
    const { data: session, error } = await tryCatch(
      auth.api.getSession({
        headers: fromNodeHeaders(context.req.headers),
      }),
    );

    if (error) throw new InternalServerErrorException(error.message);

    return await next({
      context: {
        ...context,
        session: session
          ? {
              ...session.session,
              user: session.user,
            }
          : null,
      },
    });
  },
);
