import type { TranslationKey } from "@fludge/i18n/index";
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
/*                                   Errores                                  */
/* -------------------------------------------------------------------------- */

export type TicketErrorCode =
  | "insufficient_stock"
  | "product_not_found"
  | "presentation_not_found"
  | "invalid_quantity"
  | "invalid_price";

/**
 * El mensaje conserva la clave i18n original para no romper la UI existente,
 * pero ahora también puedes discriminar por `error.code`.
 */
export class TicketError extends Error {
  readonly code: TicketErrorCode;

  constructor(code: TicketErrorCode) {
    const key = `mutations.tickets.errors.${code}` satisfies TranslationKey;

    super(key);
    this.name = "TicketError";
    this.code = code;
  }
}

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
  /** Lanza `TicketError` si no hay stock suficiente. */
  addTicketProduct: (product: AddTicketProduct) => void;
  removeTicketProduct: (ticketProductId: string) => void;
  removeTicketProductPresentations: (presentationIds: string[]) => void;
  /** Lanza `TicketError` si los datos son inválidos o no hay stock. */
  updateTicketProductPresentation: (
    ticketProductId: string,
    ticketProductPresentationId: string,
    quantity: number,
    priceSale: number,
  ) => void;
};

/* -------------------------------------------------------------------------- */
/*                                  Utilidades                                */
/* -------------------------------------------------------------------------- */

const VERSION = 1;

function generateId(): string {
  return crypto.randomUUID();
}

function nextTicketName(tickets: Ticket[]): string {
  const names = new Set(tickets.map((ticket) => ticket.name));

  let number = 1;
  while (names.has(`Ticket-${number}`)) number++;

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

/* ------------------------------- Stock/total ------------------------------- */

function getTicketProductStockQuantity(product: TicketProduct): number {
  return product.presentations.reduce(
    (total, presentation) => total + presentation.quantity * presentation.conversionFactor,
    0,
  );
}

function assertStockAvailable(product: TicketProduct): void {
  if (product.allowNegativeStock) return;

  if (getTicketProductStockQuantity(product) > product.stock) {
    throw new TicketError("insufficient_stock");
  }
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

function buildNextItems(activeTicket: Ticket, product: AddTicketProduct): TicketProduct[] {
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

    // Antes no se validaba el stock en la primera adición.
    assertStockAvailable(newProduct);

    return [...activeTicket.items, newProduct];
  }

  const mergedProduct = mergeTicketProduct(existingProduct, product);

  assertStockAvailable(mergedProduct);

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
        const tickets = await repository.load(organizationId);
        if (!tickets || tickets.length === 0) return null;
        return { state: tickets, version: VERSION };
      } catch (error) {
        console.error("No se pudieron cargar los tickets locales", error);
        return null; // arranca con el ticket por defecto
      }
    },
    setItem: async (_name: string, value: StorageValue<Ticket[]>) => {
      await repository.save(organizationId, value.state);
    },
    removeItem: async () => {
      await repository.clear(organizationId);
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

          addTicketProduct: (product) => {
            const active = selectActiveTicket(get());
            if (!active) return;

            // Valida y calcula FUERA de `set` para que el reducer sea puro.
            const nextItems = buildNextItems(active, product);

            updateActiveTicket((ticket) => ({ ...ticket, items: nextItems }));
          },

          removeTicketProduct: (ticketProductId) => {
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

          removeTicketProductPresentations: (presentationIds) => {
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

          updateTicketProductPresentation: (
            ticketProductId,
            ticketProductPresentationId,
            quantity,
            priceSale,
          ) => {
            if (!Number.isFinite(quantity) || quantity <= 0) {
              throw new TicketError("invalid_quantity");
            }

            if (!Number.isFinite(priceSale) || priceSale < 0) {
              throw new TicketError("invalid_price");
            }

            const active = selectActiveTicket(get());
            if (!active) return;

            const product = active.items.find((item) => item.id === ticketProductId);

            if (!product) throw new TicketError("product_not_found");

            if (
              !product.presentations.some(
                (presentation) => presentation.id === ticketProductPresentationId,
              )
            ) {
              throw new TicketError("presentation_not_found");
            }

            const nextProduct: TicketProduct = {
              ...product,
              presentations: product.presentations.map((presentation) =>
                presentation.id === ticketProductPresentationId
                  ? { ...presentation, quantity, priceSale }
                  : presentation,
              ),
            };

            assertStockAvailable(nextProduct);

            updateActiveTicket((ticket) => ({
              ...ticket,
              items: ticket.items.map((item) => (item.id === nextProduct.id ? nextProduct : item)),
            }));
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
