import { ORPCError } from "@orpc/client";
import { authMiddleware } from "./auth.middleware";

type Options = {
  onlyRootUser?: boolean;
};

export function requireAuthMiddleware(options?: Options) {
  return authMiddleware.concat(async ({ context, next }) => {
    if (!context.session)
      throw new ORPCError("UNAUTHORIZED", { message: "algo esta mal" });

    if (options?.onlyRootUser && !context.session.user.isRoot)
      throw new ORPCError("FORBIDDEN", { message: "Solo usuarios root" });

    return await next({
      context: {
        ...context,
        session: context.session,
      },
    });
  });
}
