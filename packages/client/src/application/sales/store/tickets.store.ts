import { getI18nKey } from "@fludge/api/modules/shared/i18n/utils";

export type CatalogPresentation = {
  readonly kind: "catalog";
  readonly id: string;
  readonly productId: string;
  readonly name: string;
  readonly conversionFactor: number;
  price: number;
  priceWholesale: number | null;
  originalPrice: number;
};

type AdHocPresentation = {
  readonly kind: "adhoc";
  readonly name: string;
  readonly conversionFactor: number;
  price: number;
};

type Presentation = CatalogPresentation | AdHocPresentation;

export type TicketItem = {
  readonly id: string;
  quantity: number;
  subtotal: number;
  presentation: Presentation;
};

type ProductStock = {
  readonly allowNegativeStock: boolean;
  readonly minStock: number;
  readonly totalStock: number;
  availableStock: number;
};

export type Ticket = {
  total: number;
  items: TicketItem[];
  products: Map<string, ProductStock>;
};

export type NewCatalogTicketItem = {
  kind: "catalog";
  quantity: number;
  presentation: CatalogPresentation;
  product: {
    id: string;
    allowNegativeStock: boolean;
    minStock: number;
    totalStock: number;
  };
};

type NewAdHocTicketItem = {
  kind: "adhoc";
  quantity: number;
  presentation: AdHocPresentation;
};

type NewTicketItem = NewCatalogTicketItem | NewAdHocTicketItem;

export type TicketMap = Map<string, Ticket>;

export type TicketsState = {
  selectedTicketId: string;
  tickets: TicketMap;
};

export const initialState: TicketsState = {
  selectedTicketId: "Ticket 1",
  tickets: new Map<string, Ticket>([
    [
      "Ticket 1",
      {
        items: [],
        products: new Map<string, ProductStock>(),
        total: 0,
      },
    ],
  ]),
};

function createTicket(tickets: TicketMap) {
  let stateIndex = tickets.size + 1;
  let newName = "Ticket " + stateIndex;

  while (tickets.has(newName)) {
    stateIndex++;
    newName = "Ticket " + stateIndex;
  }

  return {
    key: newName,
    value: {
      items: [],
      products: new Map<string, ProductStock>(),
      total: 0,
    } as Ticket,
  };
}

function addItem(ticket: Ticket, newItem: NewTicketItem): Ticket {
  // --- 0. Validar stock ANTES de tocar cualquier estado ---
  if (newItem.kind === "catalog") {
    const { product, presentation, quantity } = newItem;
    const stockDelta = quantity * presentation.conversionFactor;
    const existingProduct = ticket.products.get(product.id);
    const currentAvailable =
      existingProduct?.availableStock ?? product.totalStock;
    const projectedAvailable = currentAvailable - stockDelta;

    if (!product.allowNegativeStock && projectedAvailable < 0) {
      throw new Error(
        getI18nKey("api_errors.catalog.products.insufficient_stock"),
      );
    }
  }

  // --- 1. Buscar si ya existe un renglón con la misma presentación de catálogo ---
  let existingIndex = -1;
  if (newItem.kind === "catalog") {
    existingIndex = ticket.items.findIndex(
      (item) =>
        item.presentation.kind === "catalog" &&
        item.presentation.id === newItem.presentation.id,
    );
  }

  // --- 2. Construir el array de items actualizado ---
  let newItems: TicketItem[];

  if (existingIndex !== -1) {
    const existing = ticket.items[existingIndex]!;
    const quantity = existing.quantity + newItem.quantity;
    const updated: TicketItem = {
      ...existing,
      quantity,
      subtotal: quantity * existing.presentation.price,
    };
    newItems = [...ticket.items];
    newItems[existingIndex] = updated;
  } else {
    const item: TicketItem = {
      id: crypto.randomUUID(),
      quantity: newItem.quantity,
      subtotal: newItem.quantity * newItem.presentation.price,
      presentation: newItem.presentation,
    };
    newItems = [...ticket.items, item];
  }

  // --- 3. Sincronizar stock solo si es una presentación de catálogo ---
  let newProducts = ticket.products;

  if (newItem.kind === "catalog") {
    const { product, presentation, quantity } = newItem;
    const stockDelta = quantity * presentation.conversionFactor;
    const existingProduct = ticket.products.get(product.id);

    newProducts = new Map(ticket.products);
    newProducts.set(product.id, {
      allowNegativeStock: product.allowNegativeStock,
      minStock: product.minStock,
      totalStock: product.totalStock,
      availableStock:
        (existingProduct?.availableStock ?? product.totalStock) - stockDelta,
    });
  }

  // --- 4. Recalcular total ---
  const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    ...ticket,
    items: newItems,
    products: newProducts,
    total,
  };
}

function removeItem(ticket: Ticket, itemId: string): Ticket {
  const newItems = ticket.items.filter((item) => item.id !== itemId);

  const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);

  return { ...ticket, items: newItems, total };
}

function updateItem(ticket: Ticket, itemToUpdate: TicketItem): Ticket {
  const newItems = ticket.items.map((item) =>
    itemToUpdate.id === item.id
      ? {
          ...itemToUpdate,
          subtotal: itemToUpdate.presentation.price * itemToUpdate.quantity,
        }
      : item,
  );

  const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);

  return { ...ticket, items: newItems, total };
}

function clearTicket(ticket: Ticket): Ticket {
  return { ...ticket, items: [], products: new Map(), total: 0 };
}

function changeAllToWholesale(ticket: Ticket): Ticket {
  const newItems = ticket.items.map((item) => {
    if (item.presentation.kind === "adhoc") return item;

    if (!item.presentation.priceWholesale) return item;

    return {
      ...item,
      presentation: {
        ...item.presentation,
        price: item.presentation.priceWholesale,
      },
    };
  });

  const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);

  return { ...ticket, items: newItems, total };
}

export type TicketAction =
  | { type: "hydrate"; payload: TicketsState }
  | { type: "select-ticket"; payload: { ticketId: string } }
  | { type: "create-ticket" }
  | {
      type: "delete-ticket";
      payload: {
        ticketId: string;
      };
    }
  | {
      type: "clear-ticket";
      payload: {
        ticketId: string;
      };
    }
  | {
      type: "add-item";
      payload: {
        ticketId: string;
        item: NewTicketItem;
      };
    }
  | { type: "remove-item"; payload: { ticketId: string; itemId: string } }
  | { type: "update-item"; payload: { ticketId: string; item: TicketItem } }
  | { type: "change-all-to-wholesale"; payload: { ticketId: string } };

export function ticketsReducer(
  state: TicketsState,
  action: TicketAction,
): TicketsState {
  switch (action.type) {
    case "hydrate": {
      return action.payload;
    }

    case "select-ticket": {
      const { ticketId } = action.payload;

      if (!state.tickets.has(ticketId)) return state;

      return { ...state, selectedTicketId: ticketId };
    }

    case "create-ticket": {
      const newTicket = createTicket(state.tickets);
      const newTickets = new Map(state.tickets);
      newTickets.set(newTicket.key, newTicket.value);

      return {
        ...state,
        tickets: newTickets,
        selectedTicketId: newTicket.key,
      };
    }

    case "delete-ticket": {
      const { ticketId } = action.payload;
      const newTickets = new Map(state.tickets);
      newTickets.delete(ticketId);

      let selectedTicketId = state.selectedTicketId;
      if (selectedTicketId === ticketId) {
        selectedTicketId = newTickets.keys().next().value ?? "";
      }

      return { ...state, tickets: newTickets, selectedTicketId };
    }

    case "clear-ticket": {
      const { payload } = action;
      const ticket = state.tickets.get(payload.ticketId);

      if (!ticket) return state;

      const newTicket = clearTicket(ticket);
      const newTickets = new Map(state.tickets);
      newTickets.set(payload.ticketId, newTicket);

      return { ...state, tickets: newTickets };
    }

    case "add-item": {
      const { payload } = action;
      const ticket = state.tickets.get(payload.ticketId);

      if (!ticket) return state;

      const newTicket = addItem(ticket, payload.item);
      const newTickets = new Map(state.tickets);
      newTickets.set(payload.ticketId, newTicket);

      return { ...state, tickets: newTickets };
    }

    case "remove-item": {
      const { payload } = action;
      const ticket = state.tickets.get(payload.ticketId);

      if (!ticket) return state;

      const newTicket = removeItem(ticket, payload.itemId);
      const newTickets = new Map(state.tickets);
      newTickets.set(payload.ticketId, newTicket);

      return { ...state, tickets: newTickets };
    }

    case "update-item": {
      const { payload } = action;
      const ticket = state.tickets.get(payload.ticketId);

      if (!ticket) return state;

      const newTicket = updateItem(ticket, payload.item);
      const newTickets = new Map(state.tickets);
      newTickets.set(payload.ticketId, newTicket);

      return { ...state, tickets: newTickets };
    }

    case "change-all-to-wholesale": {
      const { payload } = action;
      const ticket = state.tickets.get(payload.ticketId);

      if (!ticket) return state;

      const newTicket = changeAllToWholesale(ticket);
      const newTickets = new Map(state.tickets);
      newTickets.set(payload.ticketId, newTicket);

      return { ...state, tickets: newTickets };
    }

    default:
      return state;
  }
}
