import { ORPCError } from "@orpc/client";
import { authMiddleware } from "./auth.middleware";
import { auth } from "@fludge/auth";
import { fromNodeHeaders } from "better-auth/node";
import { AnyOrganizationException } from "../modules/organizations/exceptions/any-organization-active.exception";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "../modules/shared/exceptions/internal-server-error.exception";

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

export function withOrganizationMiddleware(options?: Options) {
  return requireAuthMiddleware(options).concat(async ({ context, next }) => {
    const activeOrganizationId = context.session.activeOrganizationId;

    if (!activeOrganizationId) throw new AnyOrganizationException();

    const { data: selectedOrganization, error } = await tryCatch(
      auth.api.getFullOrganization({
        headers: fromNodeHeaders(context.req.headers),
      }),
    );

    if (error) throw new InternalServerErrorException(error.message);

    if (!selectedOrganization) throw new AnyOrganizationException();

    return await next({
      context: {
        ...context,
        session: context.session,
        organization: selectedOrganization,
      },
    });
  });
}
