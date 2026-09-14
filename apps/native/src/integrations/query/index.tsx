import {
  QueryClient,
  QueryClientProvider as Provider,
  onlineManager,
} from "@tanstack/react-query";
import { useTanStackQueryDevTools } from "@rozenite/tanstack-query-plugin";
import { INetworkService } from "@fludge/client/providers/network-status.provider";
import { networkService } from "../network";

export function setupQueryClientNetwork(networkService: INetworkService) {
  onlineManager.setEventListener((setOnline) => {
    return networkService.subscribe((state) => {
      const isOnline = state.isConnected && state.isInternetReachable !== false;
      setOnline(isOnline);
    });
  });
}

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

setupQueryClientNetwork(networkService);

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
      {children}
    </Provider>
  );
}
