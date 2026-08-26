import {
  QueryClient,
  QueryClientProvider as Provider,
} from "@tanstack/react-query";
import { useTanStackQueryDevTools } from "@rozenite/tanstack-query-plugin";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (__DEV__) {
    useTanStackQueryDevTools(queryClient);
  }

  return <Provider client={queryClient}>{children}</Provider>;
}
