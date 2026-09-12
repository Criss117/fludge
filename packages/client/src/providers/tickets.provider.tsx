import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  initialTicketStore,
  type TicketStore,
} from "../application/sales/store/tickets.store/data";
import {
  ticketsReducer,
  type Action,
} from "../application/sales/store/tickets.store/actions";
import { persistTickets } from "../application/sales/store/tickets.store/persistence";

export interface SyncStore {
  save: (state: TicketStore) => Promise<void>;
  load: () => Promise<TicketStore>;
}

type TicketsContextValue = {
  state: TicketStore;
  dispatch: Dispatch<Action>;
  isHydrated: boolean;
  activeTicket: TicketStore["tickets"][number] & {
    total: number;
  };
};

const TicketsContext = createContext<TicketsContextValue | null>(null);

type TicketsProviderProps = {
  children: ReactNode;
  syncStore: SyncStore;
};

export function TicketsProvider({ children, syncStore }: TicketsProviderProps) {
  const [state, dispatch] = useReducer(ticketsReducer, initialTicketStore);
  const [isHydrated, setIsHydrated] = useState(false);

  const isHydratingRef = useRef(true);

  const activeTicket = useMemo(() => {
    const ticket = state.tickets[state.activeTicketId]!;

    const total = Object.values(ticket.items).reduce(
      (sum, item) => sum + item.priceSale * item.quantity,
      0,
    );

    return { ...ticket, total };
  }, [state.activeTicketId, state.tickets]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      let validState: TicketStore;

      try {
        const loaded = await syncStore.load();
        validState = persistTickets.deserialize(loaded);
      } catch {
        // Falla la carga (primera vez, storage corrupto, error de red, etc.)
        validState = initialTicketStore;
      }

      if (cancelled) return;

      dispatch({ type: "hydrate", payload: [validState] });
      isHydratingRef.current = false;
      setIsHydrated(true);
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isHydratingRef.current) return; // no guardar durante la carga inicial

    syncStore.save(persistTickets.serialize(state)).catch(() => {
      // Si quieres reflejar esto en la UI, se podría despachar un error aquí
    });
  }, [state, syncStore]);

  return (
    <TicketsContext.Provider
      value={{ state, dispatch, isHydrated, activeTicket }}
    >
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketsContext);

  if (!context) {
    throw new Error("useTickets debe usarse dentro de un TicketsProvider");
  }

  return context;
}
