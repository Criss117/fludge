import { getI18nKey } from "@fludge/api/modules/shared/i18n/utils";

type CatalogPresentation = {
  readonly kind: "catalog";
  readonly id: string;
  readonly productId: string;
  readonly name: string;
  readonly conversionFactor: number;
  price: number;
};

type AdHocPresentation = {
  readonly kind: "adhoc";
  readonly name: string;
  readonly conversionFactor: number;
  price: number;
};

type Presentation = CatalogPresentation | AdHocPresentation;

type TicketItem = {
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

type NewCatalogTicketItem = {
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

export const initialState = new Map<string, Ticket>([
  [
    "Ticket 1",
    {
      items: [],
      products: new Map<string, ProductStock>(),
      total: 0,
    },
  ],
]);

function createTicket(state: TicketMap) {
  let stateIndex = state.size + 1;
  let newName = "Ticket " + stateIndex;

  while (state.has(newName)) {
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

export type TicketAction =
  | { type: "create-ticket" }
  | { type: "delete-ticket"; payload: string }
  | {
      type: "add-item";
      payload: {
        ticketId: string;
        item: NewTicketItem;
      };
    };

export function ticketsReducer(
  state: TicketMap,
  action: TicketAction,
): TicketMap {
  const newState = new Map(state);
  switch (action.type) {
    case "create-ticket": {
      const newTicket = createTicket(state);
      newState.set(newTicket.key, newTicket.value);
      return newState;
    }

    case "delete-ticket": {
      newState.delete(action.payload);
      return newState;
    }

    case "add-item": {
      const { payload } = action;
      const ticket = state.get(payload.ticketId);

      if (!ticket) return state;

      const newTicket = addItem(ticket, payload.item);

      newState.set(payload.ticketId, newTicket);

      return newState;
    }

    default:
      return state;
  }
}
