import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "../../routeTree.gen";
import { useAuth } from "@/core/auth/application/providers/auth.provider";
import type { LogedUser } from "@repo/core/entities/user";

export interface RouterContext {
  user: LogedUser | null;
}

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <div>404</div>,
  context: {
    user: null,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function Router() {
  const { user } = useAuth();

  return (
    <RouterProvider
      router={router}
      context={{
        user,
      }}
    />
  );
}
