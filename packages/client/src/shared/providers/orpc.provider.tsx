import type { AppRouterClient } from "@fludge/api/routers/index";
import { createORPCClient, type ClientContext } from "@orpc/client";
import { RPCLink, type RPCLinkOptions } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createContext, use } from "react";

type Context = {
  orpc: OrpcQueryClient;
};

const OrpcContext = createContext<Context | null>(null);

export function createOrpcQueryClient(options: RPCLinkOptions<ClientContext>) {
  const link = new RPCLink(options);

  const client: AppRouterClient = createORPCClient(link);

  return createTanstackQueryUtils(client);
}

export function createOrpcProvider(options: RPCLinkOptions<ClientContext>) {
  const client = createOrpcQueryClient(options);

  function OrpcProvider({ children }: { children: React.ReactNode }) {
    return (
      <OrpcContext.Provider value={{ orpc: client }}>
        {children}
      </OrpcContext.Provider>
    );
  }

  return OrpcProvider;
}

export type OrpcQueryClient = ReturnType<typeof createOrpcQueryClient>;

export function useOrpc() {
  const context = use(OrpcContext);
  if (!context)
    throw new Error(
      "useOrpc must be used within an OrpcProvider returned by createOrpcProvider()",
    );
  return context.orpc;
}
