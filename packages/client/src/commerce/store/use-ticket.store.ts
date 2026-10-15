import { createStore } from "zustand";
import { persist, type StorageValue } from "zustand/middleware";
import type {
  AddTicketProduct,
  LocalTicketRepository,
  Ticket,
} from "../domain/local-ticket.repository";
import type { PersistStorage } from "zustand/middleware";

export type TicketState = {
  tickets: Ticket[];
  selectedTicketId: number;
  switchActiveTicket: (ticketId: number) => void;
  createTicket: () => void;
  removeTicket: (ticketId: number) => void;
  renameTicket: (ticketId: number, name: string) => void;
  clearTicket: (ticketId: number) => void;
  addTicketProduct: (product: AddTicketProduct) => void;
  removeTicketProduct: (ticketProductId: string) => void;
  removeTicketProductPresentations: (presentationIds: string[]) => void;
  updateTicketProductPresentation: (
    ticketProductId: string,
    ticketProductPresentationId: string,
    quantity: number,
    priceSale: number,
  ) => void;
};
const VERSION = 1;

export function createTicketStore(
  organizationId: string,
  repository: LocalTicketRepository,
) {
  const storage: PersistStorage<Ticket[]> = {
    getItem: async () => {
      const tickets = await repository.load(organizationId);

      return {
        state: tickets,
      };
    },
    setItem: async (_name: string, workout: StorageValue<Ticket[]>) => {
      await repository.save(organizationId, workout.state);
    },
    removeItem: async () => {
      await repository.clear(organizationId);
    },
  };

  return createStore<TicketState>()(
    persist(
      (set) => ({
        tickets: [],
        selectedTicketId: 0,
      }),
      {
        name: `tickets-${organizationId}`,
        partialize: (state) => state.tickets,
        merge: (persisted, current) => {
          const tickets =
            Array.isArray(persisted) && persisted.length > 0
              ? (persisted as Ticket[])
              : current.tickets;

          // Conserva la selección actual si sigue existiendo (útil en rehydrate())
          const stillExists = tickets.some(
            (t) => t.id === current.selectedTicketId,
          );

          return {
            ...current,
            tickets,
            selectedTicketId: stillExists
              ? current.selectedTicketId
              : (tickets[0]?.id ?? current.selectedTicketId),
          };
        },
        version: VERSION,
        storage,
      },
    ),
  );
}
