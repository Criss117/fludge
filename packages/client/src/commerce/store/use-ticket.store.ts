import { unwrapResult } from "@fludge/utils/trycatch";
import { createStore } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";

import type {
  AddCatalogTicketProduct,
  AddTicketProduct,
  LocalTicketRepository,
  Ticket,
  TicketProduct,
} from "../domain/local-ticket.repository";

/* -------------------------------------------------------------------------- */
/*                                    Tipos                                   */
/* -------------------------------------------------------------------------- */

export type TicketState = {
  tickets: Ticket[];
  selectedTicketId: string;
  switchActiveTicket: (ticketId: string) => void;
  createTicket: () => void;
  removeTicket: (ticketId: string) => void;
  /** Devuelve `true` si el nombre se aplicó. */
  renameTicket: (ticketId: string, name: string) => boolean;
  clearTicket: (ticketId: string) => void;
  /** No hace nada si los datos son inválidos o no hay stock suficiente. */
  addProduct: (product: AddTicketProduct) => void;
  removeProduct: (ticketProductId: string) => void;
  removePresentations: (presentationIds: string[]) => void;
  /** No hace nada si los datos son inválidos o no hay stock suficiente. */
  updatePresentation: (v: {
    ticketItemId: string;
    ticketPresentationId: string;
    quantity: number;
    priceSale: number;
  }) => void;
};

/* -------------------------------------------------------------------------- */
/*                                  Utilidades                                */
/* -------------------------------------------------------------------------- */

const VERSION = 1;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function nextTicketName(tickets: Ticket[]): string {
  // Comparación sin distinguir mayúsculas, igual que `renameTicket`.
  const names = new Set(tickets.map((ticket) => ticket.name.toLowerCase()));

  let number = 1;
  while (names.has(`ticket-${number}`)) number++;

  return `Ticket-${number}`;
}

function makeTicket(organizationId: string, existing: Ticket[]): Ticket {
  return {
    id: generateId(),
    name: nextTicketName(existing),
    organizationId,
    items: [],
  };
}

/** Elimina restos de modelos antiguos (p. ej. `isActive`) al hidratar. */
function normalizeTicket(ticket: Ticket): Ticket {
  const { isActive: _legacy, ...rest } = ticket as Ticket & {
    isActive?: boolean;
  };

  return { ...rest, items: rest.items ?? [] };
}

/* ------------------------------- Validación -------------------------------- */

function isValidQuantity(quantity: number): boolean {
  return Number.isFinite(quantity) && quantity > 0;
}

function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price >= 0;
}

function hasValidPresentations(
  presentations: ReadonlyArray<{
    quantity: number;
    priceSale: number;
    conversionFactor: number;
  }>,
): boolean {
  return (
    presentations.length > 0 &&
    presentations.every(
      (presentation) =>
        isValidQuantity(presentation.quantity) &&
        isValidPrice(presentation.priceSale) &&
        isValidQuantity(presentation.conversionFactor),
    )
  );
}

/* ------------------------------- Stock/total ------------------------------- */

function getTicketProductStockQuantity(product: TicketProduct): number {
  return product.presentations.reduce(
    (total, presentation) => total + presentation.quantity * presentation.conversionFactor,
    0,
  );
}

function hasStockAvailable(product: TicketProduct): boolean {
  return product.allowNegativeStock || getTicketProductStockQuantity(product) <= product.stock;
}

export function computeTicketTotal(ticket: Ticket | undefined): number {
  if (!ticket) return 0;

  const total = ticket.items.reduce(
    (acc, item) =>
      acc +
      item.presentations.reduce(
        (sum, presentation) => sum + presentation.quantity * presentation.priceSale,
        0,
      ),
    0,
  );

  // Evita ruido de coma flotante (0.1 + 0.2).
  return Math.round(total * 100) / 100;
}

/* -------------------------------- Productos -------------------------------- */

function mergeTicketProduct(
  current: TicketProduct,
  incoming: AddCatalogTicketProduct,
): TicketProduct {
  let presentations = current.presentations;

  for (const incomingPresentation of incoming.presentations) {
    const exists = presentations.some(
      (presentation) => presentation.presentationId === incomingPresentation.presentationId,
    );

    presentations = exists
      ? presentations.map((presentation) =>
          presentation.presentationId === incomingPresentation.presentationId
            ? {
                ...presentation,
                quantity: presentation.quantity + incomingPresentation.quantity,
              }
            : presentation,
        )
      : [...presentations, { ...incomingPresentation, id: generateId() }];
  }

  return { ...current, presentations };
}

/** Devuelve los nuevos items o `null` si la operación no es válida. */
function buildNextItems(activeTicket: Ticket, product: AddTicketProduct): TicketProduct[] | null {
  if (!hasValidPresentations(product.presentations)) return null;

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

    return [...activeTicket.items, newProduct];
  }

  const existingProduct = activeTicket.items.find((item) => item.productId === product.productId);

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

    return hasStockAvailable(newProduct) ? [...activeTicket.items, newProduct] : null;
  }

  const mergedProduct = mergeTicketProduct(existingProduct, product);

  if (!hasStockAvailable(mergedProduct)) return null;

  return activeTicket.items.map((item) => (item.id === existingProduct.id ? mergedProduct : item));
}

/* -------------------------------------------------------------------------- */
/*                                  Selectores                                */
/* -------------------------------------------------------------------------- */

export const selectActiveTicket = (state: TicketState): Ticket | undefined =>
  state.tickets.find((ticket) => ticket.id === state.selectedTicketId);

export const selectActiveTicketTotal = (state: TicketState): number =>
  computeTicketTotal(selectActiveTicket(state));

/* -------------------------------------------------------------------------- */
/*                                    Store                                   */
/* -------------------------------------------------------------------------- */

export function createTicketStore(organizationId: string, repository: LocalTicketRepository) {
  const storage: PersistStorage<Ticket[]> = {
    getItem: async () => {
      try {
        const tickets = unwrapResult(await repository.load(organizationId));
        if (!tickets || tickets.length === 0) return null;
        return { state: tickets, version: VERSION };
      } catch (error) {
        console.error("No se pudieron cargar los tickets locales", error);
        return null; // arranca con el ticket por defecto
      }
    },
    setItem: async (_name: string, value: StorageValue<Ticket[]>) => {
      try {
        unwrapResult(await repository.save(organizationId, value.state));
      } catch (error) {
        console.error("No se pudieron guardar los tickets locales", error);
      }
    },
    removeItem: async () => {
      try {
        unwrapResult(await repository.clear(organizationId));
      } catch (error) {
        console.error("No se pudieron borrar los tickets locales", error);
      }
    },
  };

  const initialTicket = makeTicket(organizationId, []);

  return createStore<TicketState>()(
    persist(
      (set, get) => {
        /** Aplica `updater` al ticket seleccionado. Si devuelve null, no cambia nada. */
        const updateActiveTicket = (updater: (ticket: Ticket) => Ticket | null) => {
          set((state) => {
            const active = selectActiveTicket(state);
            if (!active) return state;

            const updated = updater(active);
            if (!updated) return state;

            return {
              tickets: state.tickets.map((ticket) => (ticket.id === active.id ? updated : ticket)),
            };
          });
        };

        return {
          tickets: [initialTicket],
          selectedTicketId: initialTicket.id,

          switchActiveTicket: (ticketId) => {
            set((state) => {
              if (ticketId === state.selectedTicketId) return state;
              if (!state.tickets.some((ticket) => ticket.id === ticketId)) {
                return state;
              }

              return { selectedTicketId: ticketId };
            });
          },

          createTicket: () => {
            set((state) => {
              const newTicket = makeTicket(organizationId, state.tickets);

              return {
                tickets: [...state.tickets, newTicket],
                selectedTicketId: newTicket.id,
              };
            });
          },

          removeTicket: (ticketId) => {
            set((state) => {
              const index = state.tickets.findIndex((ticket) => ticket.id === ticketId);

              if (index === -1) return state;

              const remaining = state.tickets.filter((ticket) => ticket.id !== ticketId);

              if (remaining.length === 0) {
                const fallback = makeTicket(organizationId, []);
                return { tickets: [fallback], selectedTicketId: fallback.id };
              }

              if (ticketId !== state.selectedTicketId) {
                return { tickets: remaining };
              }

              // Se borró el ticket seleccionado: selecciona el vecino anterior.
              const neighbor = remaining[Math.max(0, index - 1)]!;

              return { tickets: remaining, selectedTicketId: neighbor.id };
            });
          },

          renameTicket: (ticketId, name) => {
            const trimmed = name.trim();
            if (!trimmed) return false;

            const { tickets } = get();

            if (!tickets.some((ticket) => ticket.id === ticketId)) return false;

            const duplicated = tickets.some(
              (ticket) =>
                ticket.id !== ticketId && ticket.name.toLowerCase() === trimmed.toLowerCase(),
            );

            if (duplicated) return false;

            set({
              tickets: tickets.map((ticket) =>
                ticket.id === ticketId ? { ...ticket, name: trimmed } : ticket,
              ),
            });

            return true;
          },

          clearTicket: (ticketId) => {
            set((state) => {
              if (!state.tickets.some((ticket) => ticket.id === ticketId)) {
                return state;
              }

              return {
                tickets: state.tickets.map((ticket) =>
                  ticket.id === ticketId ? { ...ticket, items: [] } : ticket,
                ),
              };
            });
          },

          addProduct: (product) => {
            updateActiveTicket((ticket) => {
              const items = buildNextItems(ticket, product);

              return items ? { ...ticket, items } : null;
            });
          },

          removeProduct: (ticketProductId) => {
            updateActiveTicket((ticket) => {
              if (!ticket.items.some((item) => item.id === ticketProductId)) {
                return null;
              }

              return {
                ...ticket,
                items: ticket.items.filter((item) => item.id !== ticketProductId),
              };
            });
          },

          removePresentations: (presentationIds) => {
            if (presentationIds.length === 0) return;

            const idsToRemove = new Set(presentationIds);

            updateActiveTicket((ticket) => ({
              ...ticket,
              items: ticket.items
                .map((item) => ({
                  ...item,
                  presentations: item.presentations.filter(
                    (presentation) => !idsToRemove.has(presentation.id),
                  ),
                }))
                .filter((item) => item.presentations.length > 0),
            }));
          },

          updatePresentation: ({ ticketItemId, ticketPresentationId, quantity, priceSale }) => {
            if (!isValidQuantity(quantity) || !isValidPrice(priceSale)) return;

            updateActiveTicket((ticket) => {
              const product = ticket.items.find((item) => item.id === ticketItemId);
              if (!product) return null;

              if (
                !product.presentations.some(
                  (presentation) => presentation.id === ticketPresentationId,
                )
              ) {
                return null;
              }

              const nextProduct: TicketProduct = {
                ...product,
                presentations: product.presentations.map((presentation) =>
                  presentation.id === ticketPresentationId
                    ? { ...presentation, quantity, priceSale }
                    : presentation,
                ),
              };

              // Si el stock cambió y el ticket ya excedía, permite al menos
              // reducir o mantener la cantidad (solo bloquea si aumenta).
              const increases =
                getTicketProductStockQuantity(nextProduct) > getTicketProductStockQuantity(product);

              if (increases && !hasStockAvailable(nextProduct)) return null;

              return {
                ...ticket,
                items: ticket.items.map((item) =>
                  item.id === nextProduct.id ? nextProduct : item,
                ),
              };
            });
          },
        };
      },
      {
        name: `tickets-${organizationId}`,
        version: VERSION,
        storage,
        partialize: (state) => state.tickets,
        migrate: (persisted) => persisted as Ticket[],
        merge: (persisted, current) => {
          const persistedTickets = Array.isArray(persisted)
            ? (persisted as Ticket[]).map(normalizeTicket)
            : [];

          const tickets = persistedTickets.length > 0 ? persistedTickets : current.tickets;

          // Conserva la selección actual si sigue existiendo; si no, el primero.
          const selectedTicketId = tickets.some((ticket) => ticket.id === current.selectedTicketId)
            ? current.selectedTicketId
            : tickets[0]!.id;

          return { ...current, tickets, selectedTicketId };
        },
      },
    ),
  );
}
