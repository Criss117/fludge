import { ORPCError } from "@orpc/client";
import { authMiddleware } from "./auth.middleware";
import { auth } from "@fludge/auth";
import { fromNodeHeaders } from "better-auth/node";
import { AnyOrganizationException } from "../modules/organizations/exceptions/any-organization-active.exception";

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

    const selectedOrganization = await auth.api.getFullOrganization({
      headers: fromNodeHeaders(context.req.headers),
    });

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
