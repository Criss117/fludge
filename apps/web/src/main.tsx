import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

import { LoaderPage } from "./components/loader-page";
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./integrations/query";
import { IntegrationsProvider } from "./integrations";
import { useORPC } from "@fludge/client/providers/orpc.provider";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPendingComponent: () => <LoaderPage />,
  context: { queryClient, orpc: undefined!, session: null },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const { orpc } = useORPC();
  return <RouterProvider router={router} context={{ queryClient, orpc }} />;
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

let root = (window as any).__reactRoot;
if (!root) {
  root = ReactDOM.createRoot(rootElement);
  (window as any).__reactRoot = root;
}

root.render(
  <IntegrationsProvider>
    <App />
  </IntegrationsProvider>,
);
