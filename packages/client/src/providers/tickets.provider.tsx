import {
  createContext,
  use,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ActionDispatch,
} from "react";
import {
  initialState,
  ticketsReducer,
  type Ticket,
  type TicketAction,
  type TicketsState,
} from "../application/sales/store/tickets.store";

function mapReplacer(_key: string, value: unknown) {
  if (value instanceof Map) {
    return { __type: "Map", entries: Array.from(value.entries()) };
  }
  return value;
}

function mapReviver(_key: string, value: any) {
  if (value && value.__type === "Map") {
    return new Map(value.entries);
  }
  return value;
}

// react-doctor-disable-next-line only-export-components -- Serialization helper is colocated with its provider storage contract.
export function serializeTicketsState(state: TicketsState): string {
  return JSON.stringify(state, mapReplacer);
}

// react-doctor-disable-next-line only-export-components -- Deserialization helper belongs to the provider storage contract.
export function deserializeTicketsState(raw: string): TicketsState {
  return JSON.parse(raw, mapReviver);
}

export interface SyncStore {
  save: (state: TicketsState) => Promise<void>;
  load: () => Promise<TicketsState>;
}

interface Root {
  sync: SyncStore;
  children: React.ReactNode;
}

interface Context {
  tickets: TicketsState["tickets"];
  selectedTicketId: string;
  selectedTicket: Ticket | undefined;
  dispatch: ActionDispatch<[action: TicketAction]>;
  isHydrated: boolean;
}

const TicketsContext = createContext<Context | null>(null);

export function useTickets() {
  const context = use(TicketsContext);

  if (!context)
    throw new Error("TicketsContext must be used within a Provider");

  return context;
}

export function TicketsProvider({ children, sync }: Root) {
  const [state, dispatch] = useReducer(ticketsReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    sync.load().then((loaded) => {
      if (!cancelled) {
        dispatch({ type: "hydrate", payload: loaded });
        setIsHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sync]);

  useEffect(() => {
    if (!isHydrated) return;

    sync.save(state);
  }, [state, isHydrated, sync]);

  const selectedTicket = useMemo(
    () => state.tickets.get(state.selectedTicketId),
    [state.tickets, state.selectedTicketId],
  );

  const contextValue = useMemo(
    () => ({
      tickets: state.tickets,
      selectedTicketId: state.selectedTicketId,
      selectedTicket,
      dispatch,
      isHydrated,
    }),
    [
      state.tickets,
      state.selectedTicketId,
      selectedTicket,
      dispatch,
      isHydrated,
    ],
  );

  return (
    <TicketsContext.Provider value={contextValue}>
      {children}
    </TicketsContext.Provider>
  );
}
