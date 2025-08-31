import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "../../routeTree.gen";
import { useAuth } from "@/core/auth/application/providers/auth.provider";
import type { LogedUser } from "@repo/core/entities/user";
import { useQueryClient } from "@tanstack/react-query";

export interface RouterContext {
  user: LogedUser | null;
  queryClient: ReturnType<typeof useQueryClient> | null;
}

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <div>404</div>,
  context: {
    user: null,
    queryClient: null,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function Router() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return (
    <RouterProvider
      router={router}
      context={{
        user,
        queryClient,
      }}
    />
  );
}
