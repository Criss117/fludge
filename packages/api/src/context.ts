import { auth } from "@fludge/auth";
import type { Context as ElysiaContext } from "elysia";

export type CreateContextOptions = {
  context: ElysiaContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  return {
    headers: context.request.headers,
    session: session
      ? {
          ...session.session,
          user: session.user,
        }
      : null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
