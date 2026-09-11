import { createContext, use, useReducer, type ActionDispatch } from "react";
import {
  initialState,
  ticketsReducer,
  type TicketAction,
  type TicketMap,
} from "../application/sales/store/tickets.store";

interface Context {
  tickets: TicketMap;
  dispatch: ActionDispatch<[action: TicketAction]>;
}

const TicketsContext = createContext<Context | null>(null);

export function useTickets() {
  const context = use(TicketsContext);

  if (!context)
    throw new Error("TicketsContext must be used within a Provider");

  return context;
}

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const [tickets, dispatch] = useReducer(ticketsReducer, initialState);

  return (
    <TicketsContext.Provider value={{ tickets, dispatch }}>
      {children}
    </TicketsContext.Provider>
  );
}
