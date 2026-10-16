import { createStore } from "zustand";
import { persist, type StorageValue } from "zustand/middleware";
import type {
  AddCatalogTicketProduct,
  AddTicketProduct,
  LocalTicketRepository,
  Ticket,
  TicketProduct,
} from "../domain/local-ticket.repository";
import type { PersistStorage } from "zustand/middleware";

export type TicketState = {
  tickets: Ticket[];
  selectedTicketId: string;
  activeTicket: Ticket | undefined;
  activeTicketTotal: number;
  switchActiveTicket: (ticketId: string) => void;
  createTicket: () => void;
  removeTicket: (ticketId: string) => void;
  renameTicket: (ticketId: string, name: string) => void;
  clearTicket: (ticketId: string) => void;
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
function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 11)}`;
}

function getTicketProductStockQuantity(product: TicketProduct): number {
  return product.presentations.reduce(
    (total, presentation) =>
      total + presentation.quantity * presentation.conversionFactor,
    0,
  );
}

function validateTicketProductStock(product: TicketProduct) {
  if (product.allowNegativeStock) return;

  const requestedQuantity = getTicketProductStockQuantity(product);

  if (requestedQuantity > product.stock) {
    throw new Error("mutations.tickets.errors.insufficient_stock");
  }
}

function mergeTicketProduct(
  current: TicketProduct,
  incoming: AddCatalogTicketProduct,
): TicketProduct {
  const presentations = [...current.presentations];

  for (const incomingPresentation of incoming.presentations) {
    const existingPresentation = presentations.find(
      (presentation) =>
        presentation.presentationId === incomingPresentation.presentationId,
    );

    if (!existingPresentation) {
      presentations.push({
        ...incomingPresentation,
        id: generateId(),
      });
      continue;
    }

    existingPresentation.quantity += incomingPresentation.quantity;
  }

  return {
    ...current,
    presentations,
  };
}

function makeDefaultTicket(organizationId: string): Ticket {
  return {
    id: generateId(),
    isActive: true,
    name: "Ticket-1",
    organizationId,
    items: [],
  };
}

function ensureOneActiveTicket(tickets: Ticket[]): Ticket[] {
  if (tickets.length === 0) return tickets;

  const someActive = tickets.some((ticket) => ticket.isActive);

  if (someActive) return tickets;

  const [first, ...rest] = tickets;
  return [{ ...first!, isActive: true }, ...rest];
}

function computeTicketTotal(ticket: Ticket): number {
  return ticket.items.reduce((total, item) => {
    const itemTotal = item.presentations.reduce(
      (sum, presentation) =>
        sum + presentation.quantity * presentation.priceSale,
      0,
    );

    return total + itemTotal;
  }, 0);
}

function deriveActiveTicket(
  tickets: Ticket[],
  selectedTicketId: string,
): {
  activeTicket: Ticket | undefined;
  activeTicketTotal: number;
  selectedTicketId: string;
} {
  const activeTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ??
    tickets.find((ticket) => ticket.isActive);

  return {
    activeTicket,
    activeTicketTotal: activeTicket ? computeTicketTotal(activeTicket) : 0,
    selectedTicketId: activeTicket?.id ?? selectedTicketId,
  };
}

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
    setItem: async (_name: string, value: StorageValue<Ticket[]>) => {
      await repository.save(organizationId, value.state);
    },
    removeItem: async () => {
      await repository.clear(organizationId);
    },
  };

  return createStore<TicketState>()(
    persist(
      (set) => ({
        tickets: [],
        selectedTicketId: "",
        activeTicket: undefined,
        activeTicketTotal: 0,

        switchActiveTicket: (ticketId) => {
          set((state) => {
            const target = state.tickets.find((ticket) => ticket.id === ticketId);

            if (!target || target.isActive) return state;

            const nextTickets = state.tickets.map((ticket) =>
              ticket.id === ticketId
                ? { ...ticket, isActive: true }
                : { ...ticket, isActive: false },
            );

            return {
              tickets: nextTickets,
              ...deriveActiveTicket(nextTickets, ticketId),
            };
          });
        },

        createTicket: () => {
          set((state) => {
            const existingNames = new Set(state.tickets.map((t) => t.name));

            let number = state.tickets.length + 1;
            let name = `Ticket-${number}`;

            while (existingNames.has(name)) {
              number++;
              name = `Ticket-${number}`;
            }

            const newTicket: Ticket = {
              id: generateId(),
              isActive: true,
              name,
              organizationId,
              items: [],
            };

            const nextTickets = [
              ...state.tickets.map((ticket) => ({ ...ticket, isActive: false })),
              newTicket,
            ];

            return {
              tickets: nextTickets,
              ...deriveActiveTicket(nextTickets, newTicket.id),
            };
          });
        },

        removeTicket: (ticketId) => {
          set((state) => {
            if (!state.tickets.some((ticket) => ticket.id === ticketId)) {
              return state;
            }

            let nextTickets = state.tickets.filter(
              (ticket) => ticket.id !== ticketId,
            );

            if (nextTickets.length === 0) {
              nextTickets = [makeDefaultTicket(organizationId)];
            } else {
              nextTickets = ensureOneActiveTicket(nextTickets);
            }

            return {
              tickets: nextTickets,
              ...deriveActiveTicket(nextTickets, state.selectedTicketId),
            };
          });
        },

        renameTicket: (ticketId, name) => {
          set((state) => {
            if (!state.tickets.some((ticket) => ticket.id === ticketId)) {
              return state;
            }

            if (state.tickets.some((ticket) => ticket.name === name)) {
              return state;
            }

            const nextTickets = state.tickets.map((ticket) =>
              ticket.id === ticketId ? { ...ticket, name } : ticket,
            );

            return {
              tickets: nextTickets,
              ...deriveActiveTicket(nextTickets, state.selectedTicketId),
            };
          });
        },

        clearTicket: (ticketId) => {
          set((state) => {
            if (!state.tickets.some((ticket) => ticket.id === ticketId)) {
              return state;
            }

            const nextTickets = state.tickets.map((ticket) =>
              ticket.id === ticketId ? { ...ticket, items: [] } : ticket,
            );

            return {
              tickets: nextTickets,
              ...deriveActiveTicket(nextTickets, state.selectedTicketId),
            };
          });
        },

        addTicketProduct: (product) => {
          set((state) => {
            const activeTicket = state.tickets.find((ticket) => ticket.isActive);

            if (!activeTicket) return state;

            let nextItems: TicketProduct[];

            if (product.type === "adHoc") {
              const newProduct: TicketProduct = {
                ...product,
                id: generateId(),
                ticketId: activeTicket.id,
                productId: null,
                presentations: product.presentations.map((presentation) => ({
                  ...presentation,
                  id: generateId(),
                  presentationId: null,
                })),
              };

              nextItems = [...activeTicket.items, newProduct];
            } else {
              const existingProduct = activeTicket.items.find(
                (item) => item.productId === product.productId,
              );

              if (!existingProduct) {
                const nextProductId = generateId();

                const newProduct: TicketProduct = {
                  ...product,
                  id: nextProductId,
                  ticketId: activeTicket.id,
                  presentations: product.presentations.map((presentation) => ({
                    ...presentation,
                    id: generateId(),
                    ticketProductId: nextProductId,
                  })),
                };

                nextItems = [...activeTicket.items, newProduct];
              } else {
                const mergedProduct = mergeTicketProduct(existingProduct, product);

                validateTicketProductStock(mergedProduct);

                nextItems = activeTicket.items.map((item) =>
                  item.productId === product.productId
                    ? mergedProduct
                    : item,
                );
              }
            }

            const nextTickets = state.tickets.map((ticket) =>
              ticket.id === activeTicket.id
                ? { ...ticket, items: nextItems }
                : ticket,
            );

            return {
              tickets: nextTickets,
              ...deriveActiveTicket(nextTickets, state.selectedTicketId),
            };
          });
        },

        removeTicketProduct: (ticketProductId) => {
          set((state) => {
            const activeTicket = state.tickets.find((ticket) => ticket.isActive);

            if (!activeTicket) return state;

            if (
              !activeTicket.items.some((item) => item.id === ticketProductId)
            ) {
              return state;
            }

            const nextItems = activeTicket.items.filter(
              (item) => item.id !== ticketProductId,
            );

            const nextTickets = state.tickets.map((ticket) =>
              ticket.id === activeTicket.id
                ? { ...ticket, items: nextItems }
                : ticket,
            );

            return {
              tickets: nextTickets,
              ...deriveActiveTicket(nextTickets, state.selectedTicketId),
            };
          });
        },

        removeTicketProductPresentations: (presentationIds) => {
          set((state) => {
            const activeTicket = state.tickets.find((ticket) => ticket.isActive);

            if (!activeTicket) return state;

            if (presentationIds.length === 0) return state;

            const idsToRemove = new Set(presentationIds);

            const nextItems = activeTicket.items
              .map((item) => ({
                ...item,
                presentations: item.presentations.filter(
                  (presentation) => !idsToRemove.has(presentation.id),
                ),
              }))
              .filter((item) => item.presentations.length > 0);

            const nextTickets = state.tickets.map((ticket) =>
              ticket.id === activeTicket.id
                ? { ...ticket, items: nextItems }
                : ticket,
            );

            return {
              tickets: nextTickets,
              ...deriveActiveTicket(nextTickets, state.selectedTicketId),
            };
          });
        },

        updateTicketProductPresentation: (
          ticketProductId,
          ticketProductPresentationId,
          quantity,
          priceSale,
        ) => {
          set((state) => {
            const activeTicket = state.tickets.find((ticket) => ticket.isActive);

            if (!activeTicket) return state;

            const product = activeTicket.items.find(
              (item) => item.id === ticketProductId,
            );

            if (!product)
              throw new Error("mutations.tickets.errors.product_not_found");

            const presentationExists = product.presentations.some(
              (presentation) => presentation.id === ticketProductPresentationId,
            );

            if (!presentationExists)
              throw new Error("mutations.tickets.errors.presentation_not_found");

            const nextProduct: TicketProduct = {
              ...product,
              presentations: product.presentations.map((presentation) =>
                presentation.id === ticketProductPresentationId
                  ? { ...presentation, quantity, priceSale }
                  : presentation,
              ),
            };

            validateTicketProductStock(nextProduct);

            const nextItems = activeTicket.items.map((item) =>
              item.id === product.id ? nextProduct : item,
            );

            const nextTickets = state.tickets.map((ticket) =>
              ticket.id === activeTicket.id
                ? { ...ticket, items: nextItems }
                : ticket,
            );

            return {
              tickets: nextTickets,
              ...deriveActiveTicket(nextTickets, state.selectedTicketId),
            };
          });
        },
      }),
      {
        name: `tickets-${organizationId}`,
        partialize: (state) => state.tickets,
        merge: (persisted, current) => {
          const tickets =
            Array.isArray(persisted) && persisted.length > 0
              ? (persisted as Ticket[])
              : current.tickets;

          const nextTickets = ensureOneActiveTicket(tickets);

          return {
            ...current,
            tickets: nextTickets,
            ...deriveActiveTicket(nextTickets, current.selectedTicketId),
          };
        },
        version: VERSION,
        storage,
      },
    ),
  );
}
