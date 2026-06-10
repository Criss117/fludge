import {
  QueryClient,
  MutationCache,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ORPCError } from "@orpc/client";
import { toast } from "sonner";

function handleError(error: unknown, queryKey?: readonly unknown[]) {
  if (!(error instanceof ORPCError)) {
    toast.error("Error inesperado. Contacte soporte.", { id: "unexpected" });
    return;
  }

  const CRITICAL_CODES = new Set([
    "INTERNAL_SERVER_ERROR",
    "SERVICE_UNAVAILABLE",
  ]);

  if (CRITICAL_CODES.has(error.code)) {
    window.location.replace(
      "/error?message=" + error.message + "&code=" + error.code,
    );
    return;
  }

  toast.error(error.message, {
    description: `Código: ${error.code}`,
    action: queryKey
      ? {
          label: "Reintentar",
          onClick: () => queryClient.invalidateQueries({ queryKey }),
        }
      : undefined,
    duration: 8000,
  });
}

export const queryClient = new QueryClient({
  // queryCache: new QueryCache({
  //   onError: (error, query) => handleError(error, query.queryKey),
  // }),

  mutationCache: new MutationCache({
    onError: (error) => handleError(error),
  }),

  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
    mutations: {
      retry: false,
    },
  },
});
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
