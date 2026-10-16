import {
  createContext,
  use,
  useCallback,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import {
  createTicketStore,
  selectActiveTicket,
  selectActiveTicketTotal,
  type TicketState,
} from "../commerce/store/use-ticket.store";
import { useAppState } from "../iam/hooks/use-app-state";
import { useContainer } from "./container.provider";

type TicketStore = ReturnType<typeof createTicketStore>;

const TicketStoreContext = createContext<TicketStore | null>(null);

/* -------------------------------------------------------------------------- */
/*                                  Providers                                 */
/* -------------------------------------------------------------------------- */

/**
 * Resuelve la organización activa y monta un store por organización.
 * El `key` fuerza a React a descartar el store anterior (y crear uno nuevo)
 * cuando cambia la organización.
 */
export function TicketStoreProvider({ children }: { children: ReactNode }) {
  const {
    data: { activeOrganization },
  } = useAppState();

  if (!activeOrganization) {
    throw new Error(
      "TicketStoreProvider requires an active organization. Render it inside the authenticated/organization boundary.",
    );
  }

  return (
    <OrganizationTicketStoreProvider
      key={activeOrganization.id}
      organizationId={activeOrganization.id}
    >
      {children}
    </OrganizationTicketStoreProvider>
  );
}

function OrganizationTicketStoreProvider({
  organizationId,
  children,
}: {
  organizationId: string;
  children: ReactNode;
}) {
  const { commerceContainer } = useContainer();

  // Inicialización perezosa: el store se crea una sola vez por montaje.
  const [store] = useState(() =>
    createTicketStore(
      organizationId,
      commerceContainer.repositories.localTicketRepository,
    ),
  );

  return (
    <TicketStoreContext.Provider value={store}>
      {children}
    </TicketStoreContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Hooks                                   */
/* -------------------------------------------------------------------------- */

function useTicketStoreApi(): TicketStore {
  const store = use(TicketStoreContext);

  if (!store) {
    throw new Error(
      "Ticket store hooks must be used within a TicketStoreProvider",
    );
  }

  return store;
}

export function useTicketStore<T>(selector: (state: TicketState) => T): T {
  return useStore(useTicketStoreApi(), selector);
}

/** Acceso a las acciones sin suscribirse a cambios de estado. */
export function useTicketActions(): TicketState {
  return useTicketStoreApi().getState();
}

export function useTicketsHydrated(): boolean {
  const store = useTicketStoreApi();

  const subscribe = useCallback(
    (onChange: () => void) => store.persist.onFinishHydration(onChange),
    [store],
  );

  return useSyncExternalStore(
    subscribe,
    () => store.persist.hasHydrated(),
    () => false,
  );
}

export function useActiveTicket() {
  const ticket = useTicketStore(selectActiveTicket);
  const total = useTicketStore(selectActiveTicketTotal);

  return ticket ? { ...ticket, total } : null;
}
