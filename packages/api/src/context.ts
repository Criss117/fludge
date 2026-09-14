import { auth } from "@fludge/auth";
import { ORGANIZATION_HEADER_KEY } from "@fludge/utils/constants";
import type { Context as ElysiaContext } from "elysia";

export type CreateContextOptions = {
  context: ElysiaContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  const activeOrganizationId = context.request.headers.get(
    ORGANIZATION_HEADER_KEY,
  );

  return {
    headers: context.request.headers,
    session: session
      ? {
          ...session.session,
          activeOrganizationId: activeOrganizationId ?? null,
          user: session.user,
        }
      : null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
