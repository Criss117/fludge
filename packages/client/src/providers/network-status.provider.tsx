import { useQuery } from "@tanstack/react-query";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useOrpc } from "./orpc.provider";

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

export interface INetworkService {
  getState(): Promise<NetworkState>;
  subscribe(callback: (state: NetworkState) => void): () => void;
}

export type NetworkStatus =
  | "checking" // verificando (arranque o reconexión)
  | "offline" // sin internet
  | "server-down" // hay internet, pero el servidor no responde
  | "online"; // internet + servidor OK

interface NetworkContextValue extends NetworkState {
  status: NetworkStatus;
  /** Hay conexión a internet */
  isOnline: boolean;
  /** Internet + servidor funcionando */
  isFullyOnline: boolean;
  /** Fuerza una verificación inmediata del servidor */
  checkServer: () => void;
  /** Suscripción a reconexiones (internet + servidor) */
  onReconnect: (callback: () => void) => () => void;
}

const PING_INTERVAL_MS = 15_000;
const PING_TIMEOUT_MS = 5_000;

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

export function NetworkProvider({
  networkService,
  loader = null,
  children,
}: {
  networkService: INetworkService;
  /** Se muestra solo hasta completar la primera verificación */
  loader?: React.ReactNode;
  children: React.ReactNode;
}) {
  const orpc = useOrpc();
  const [state, setState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
  });
  // true cuando ya conocemos el estado real del dispositivo
  const [deviceReady, setDeviceReady] = useState(false);

  const reconnectListeners = useRef<Set<() => void>>(new Set());
  const wasOnlineRef = useRef(true);

  const isOnline = state.isConnected && state.isInternetReachable !== false;

  // Estado de red del dispositivo (implementación según plataforma)
  useEffect(() => {
    let active = true;
    networkService.getState().then((s) => {
      if (!active) return;
      setState(s);
      setDeviceReady(true);
    });
    const unsubscribe = networkService.subscribe((s) => {
      setState(s);
      setDeviceReady(true);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [networkService]);

  // Health check del servidor
  const ping = useQuery({
    // isOnline en la key: cada vez que vuelve internet empieza un ping limpio
    queryKey: ["network", "server-ping", isOnline],
    queryFn: async () => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          orpc.ping.call(),
          new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error("ping timeout")), PING_TIMEOUT_MS);
          }),
        ]);
        return true;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    enabled: deviceReady && isOnline,
    refetchInterval: PING_INTERVAL_MS,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    networkMode: "always",
  });

  // Estado único, derivado
  const status: NetworkStatus = !deviceReady
    ? "checking"
    : !isOnline
      ? "offline"
      : ping.isPending
        ? "checking"
        : ping.isSuccess
          ? "online"
          : "server-down";

  // Gate: la primera verificación bloquea el render de la app
  const [hasChecked, setHasChecked] = useState(false);
  useEffect(() => {
    if (!hasChecked && status !== "checking") setHasChecked(true);
  }, [hasChecked, status]);

  // Transición hacia "online" (internet + servidor)
  useEffect(() => {
    const isNowOnline = status === "online";
    if (isNowOnline && !wasOnlineRef.current) {
      reconnectListeners.current.forEach((cb) => cb());
    }
    wasOnlineRef.current = isNowOnline;
  }, [status]);

  const onReconnect = useCallback((callback: () => void) => {
    reconnectListeners.current.add(callback);
    return () => {
      reconnectListeners.current.delete(callback);
    };
  }, []);

  const checkServer = useCallback(() => {
    void ping.refetch();
  }, [ping.refetch]);

  const value = useMemo<NetworkContextValue>(
    () => ({
      ...state,
      status,
      isOnline,
      isFullyOnline: status === "online",
      checkServer,
      onReconnect,
    }),
    [state, status, isOnline, checkServer, onReconnect],
  );

  return (
    <NetworkContext.Provider value={value}>
      {hasChecked ? children : loader}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = use(NetworkContext);
  if (!ctx) throw new Error("useNetwork debe usarse dentro de NetworkProvider");
  return ctx;
}
