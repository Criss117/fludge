import type { QueryClient } from "@tanstack/react-query";

import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import "../index.css";
import type { orpc } from "@/integrations/orpc";
import type { useAuth } from "@/integrations/auth/context";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
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
    scripts: [
      {
        crossOrigin: "anonymous",
        src: "//unpkg.com/react-scan/dist/auto.global.js",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <div className="min-h-dvh">
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
