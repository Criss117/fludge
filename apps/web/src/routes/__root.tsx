import "../index.css";

import { Toaster } from "@fludge/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { useORPC } from "@fludge/client/providers/orpc.provider";
import { AuthProvider } from "@/integrations/auth/provider";

export interface RouterAppContext {
  queryClient: QueryClient;
  orpc: ReturnType<typeof useORPC>["orpc"];
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      context.orpc.auth.queries.getSession.queryOptions(),
    );

    return {
      session,
    };
  },
  head: () => ({
    meta: [
      {
        title: "fludge",
      },
      {
        name: "description",
        content: "fludge is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <div>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </div>
      <Toaster richColors />
      <TanStackDevtools
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
          },
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
