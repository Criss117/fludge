import {
  createContext,
  use,
  useCallback,
  useState,
  useSyncExternalStore,
} from "react";
import {
  createTicketStore,
  type TicketState,
} from "../commerce/store/use-ticket.store";
import { useContainer } from "./container.provider";
import { useStore } from "zustand";
import { useAppState } from "../iam/hooks/use-app-state";

type TicketStore = ReturnType<typeof createTicketStore>;
const TicketStoreContext = createContext<TicketStore | null>(null);

export function TicketStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { commerceContainer } = useContainer();
  const {
    data: { activeOrganization },
  } = useAppState();

  const [store] = useState(() =>
    createTicketStore(
      activeOrganization!.id,
      commerceContainer.repositories.localTicketRepository,
    ),
  );

  return (
    <TicketStoreContext.Provider value={store}>
      {children}
    </TicketStoreContext.Provider>
  );
}

export function useTicketStore<T>(selector: (s: TicketState) => T): T {
  const store = use(TicketStoreContext);

  if (!store)
    throw new Error("useTicketStore must be used within a TicketStoreProvider");

  return useStore(store, selector);
}

export function useTicketsHydrated(): boolean {
  const store = use(TicketStoreContext)!;

  const subscribe = useCallback(
    (cb: () => void) => store.persist.onFinishHydration(cb),
    [store],
  );

  return useSyncExternalStore(
    subscribe,
    () => store.persist.hasHydrated(),
    () => false,
  );
}
