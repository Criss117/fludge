import {
  QueryClient,
  QueryClientProvider as Provider,
} from "@tanstack/react-query";
import { useTanStackQueryDevTools } from "@rozenite/tanstack-query-plugin";
import { DbClient, DbProvider } from "@tanstack/react-db";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

const dbClient = new DbClient({ queryClient });

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (__DEV__) {
    useTanStackQueryDevTools(queryClient);
  }

  return (
    <Provider client={queryClient}>
      <DbProvider client={dbClient}>{children}</DbProvider>
    </Provider>
  );
}
