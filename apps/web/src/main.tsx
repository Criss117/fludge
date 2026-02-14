import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

import { routeTree } from "./routeTree.gen";
import { Integrations } from "./integrations";
import { orpc } from "./integrations/orpc";
import { queryClient } from "./integrations/tanstack-query";
import { useAuth } from "./integrations/auth/context";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: { orpc, queryClient, auth: undefined! },
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  },
});

function Main() {
  const auth = useAuth();

  return (
    <RouterProvider
      router={router}
      context={{
        auth,
      }}
    />
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <Integrations>
      <Main />
    </Integrations>,
  );
}
