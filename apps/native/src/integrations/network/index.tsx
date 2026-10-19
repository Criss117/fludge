import {
  type INetworkService,
  NetworkProvider as NP,
  type NetworkState,
} from "@fludge/client/providers/network-status.provider";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

import { LoadingScreen } from "@/core/shared/components/loading-screen";

const toState = (s: NetInfoState): NetworkState => ({
  isConnected: !!s.isConnected,
  isInternetReachable: s.isInternetReachable,
});

export const networkService: INetworkService = {
  async getState() {
    return toState(await NetInfo.fetch());
  },
  subscribe(callback) {
    return NetInfo.addEventListener((s) => callback(toState(s)));
  },
};
export function NetworkProvider({ children }: { children: React.ReactNode }) {
  return (
    <NP networkService={networkService} loader={<LoadingScreen message="app.loading.network" />}>
      {children}
    </NP>
  );
}
