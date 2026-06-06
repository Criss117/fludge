import { createContext, use } from "react";
import { createORPCClient, type ClientContext } from "@orpc/client";
import { RPCLink, type RPCLinkOptions } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "@fludge/api/routers/index";

interface RootProps {
  children: React.ReactNode;
  options: RPCLinkOptions<ClientContext>;
}

export type ORPCType = ReturnType<
  typeof createTanstackQueryUtils<AppRouterClient>
>;

export type ORPCContextType = {
  orpc: ORPCType;
  client: AppRouterClient;
};

function createLink(options: RPCLinkOptions<ClientContext>) {
  const link = new RPCLink(options);

  const client: AppRouterClient = createORPCClient(link);

  const orpc = createTanstackQueryUtils(client);

  return {
    client,
    orpc,
  };
}

const ORPCContext = createContext<ORPCContextType | null>(null);

export function useORPC() {
  const context = use(ORPCContext);

  if (!context) throw new Error("useORPC must be used within an ORPCProvider");

  return context;
}

export function ORPCProvider({ children, options }: RootProps) {
  const { orpc, client } = createLink(options);

  return (
    <ORPCContext.Provider value={{ orpc, client }}>
      {children}
    </ORPCContext.Provider>
  );
}
