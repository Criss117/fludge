import {
  createContext,
  use,
  useEffect,
  useReducer,
  useState,
  type ActionDispatch,
} from "react";
import {
  initialState,
  ticketsReducer,
  type TicketAction,
  type TicketMap,
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

export function serializeTicketMap(tickets: TicketMap): string {
  return JSON.stringify(tickets, mapReplacer);
}

export function deserializeTicketMap(raw: string): TicketMap {
  return JSON.parse(raw, mapReviver);
}

export interface SyncStore {
  save: (tickets: TicketMap) => Promise<void>;
  load: () => Promise<TicketMap>;
}

interface Root {
  sync: SyncStore;
  children: React.ReactNode;
}

interface Context {
  tickets: TicketMap;
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
  const [tickets, dispatch] = useReducer(ticketsReducer, initialState);
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

    sync.save(tickets);
  }, [tickets, isHydrated, sync]);

  return (
    <TicketsContext.Provider value={{ tickets, dispatch, isHydrated }}>
      {children}
    </TicketsContext.Provider>
  );
}
