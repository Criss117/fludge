// mobile/infrastructure/RNNetworkService.ts
import {
  NetworkProvider as NP,
  type INetworkService,
  type NetworkState,
} from "@fludge/client/providers/network-status.provider";
import NetInfo from "@react-native-community/netinfo";

class RNNetworkService implements INetworkService {
  async getState(): Promise<NetworkState> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
    };
  }

  subscribe(callback: (state: NetworkState) => void): () => void {
    return NetInfo.addEventListener((state) => {
      callback({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
      });
    });
  }
}

export const networkService = new RNNetworkService();

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  return <NP networkService={networkService}>{children}</NP>;
}
