import {
  QueryClient,
  QueryClientProvider as Provider,
} from "@tanstack/react-query";
import { useTanStackQueryDevTools } from "@rozenite/tanstack-query-plugin";
import { DbClient, DbProvider } from "@tanstack/react-db";

// react-doctor-disable-next-line only-export-components -- React Query client is an integration singleton shared by the provider.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
    mutations: {
      retry: 0,
    },
  },
});

const dbClient = new DbClient({ queryClient });

function QueryDevTools() {
  useTanStackQueryDevTools(queryClient);
  return null;
}

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider client={queryClient}>
      {__DEV__ && <QueryDevTools />}
      <DbProvider client={dbClient}>{children}</DbProvider>
    </Provider>
  );
}
