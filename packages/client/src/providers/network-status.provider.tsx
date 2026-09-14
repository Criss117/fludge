import { createContext, use, useEffect, useRef, useState } from "react";

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

export interface INetworkService {
  getState(): Promise<NetworkState>;
  subscribe(callback: (state: NetworkState) => void): () => void;
}
interface NetworkContextValue extends NetworkState {
  isOnline: boolean;
  onReconnect: (callback: () => void) => () => void; // suscripción a reconexiones
}

const NetworkContext = createContext<NetworkContextValue | undefined>(
  undefined,
);

export function NetworkProvider({
  networkService,
  children,
}: {
  networkService: INetworkService;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
  });
  const wasOnlineRef = useRef(true);
  const reconnectListeners = useRef<Set<() => void>>(new Set());

  const isOnline = state.isConnected && state.isInternetReachable !== false;

  useEffect(() => {
    networkService.getState().then(setState);
    const unsubscribe = networkService.subscribe(setState);
    return unsubscribe;
  }, [networkService]);

  useEffect(() => {
    // Detecta la transición offline -> online
    if (isOnline && !wasOnlineRef.current) {
      reconnectListeners.current.forEach((cb) => cb());
    }
    wasOnlineRef.current = isOnline;
  }, [isOnline]);

  const onReconnect = (callback: () => void) => {
    reconnectListeners.current.add(callback);
    return () => reconnectListeners.current.delete(callback);
  };

  const value: NetworkContextValue = { ...state, isOnline, onReconnect };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = use(NetworkContext);
  if (!ctx) throw new Error("useNetwork debe usarse dentro de NetworkProvider");
  return ctx;
}
