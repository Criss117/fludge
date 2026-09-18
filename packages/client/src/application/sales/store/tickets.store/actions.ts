import { initialTicketStore } from "./data";
import type { TranslationKey } from "@fludge/i18n/index";

import type {
  AdHocTicketItem,
  CatalogTicketItem,
  NewAdHocTicketItem,
  NewCatalogTicketItem,
  NewTicketItem,
  ProductStore,
  Ticket,
  TicketItemUpdate,
  TicketStore,
} from "./data";

const MAX_TICKET_NAME_LENGTH = 15;

function withError(store: TicketStore, error: TranslationKey): TicketStore {
  return { ...store, lastError: error };
}

function clearError(store: TicketStore): TicketStore {
  return store.lastError === null ? store : { ...store, lastError: null };
}

function hydrate(_store: TicketStore, newStore: TicketStore): TicketStore {
  return newStore;
}

function createTicket(store: TicketStore): TicketStore {
  let stateIndex = Object.keys(store.tickets).length + 1;
  let newName = `Ticket ${stateIndex}`;

  while (store.tickets[newName]) {
    stateIndex++;
    newName = `Ticket ${stateIndex}`;
  }

  return {
    ...store,
    activeTicketId: newName,
    lastError: null,
    tickets: {
      ...store.tickets,
      [newName]: { id: newName, items: {}, products: {} },
    },
  };
}

function deleteTicket(store: TicketStore, ticketId: string): TicketStore {
  if (!store.tickets[ticketId]) {
    return withError(store, "forms.ticket.not_found");
  }

  const remainingTicketIds = Object.keys(store.tickets).filter(
    (id) => id !== ticketId,
  );

  if (remainingTicketIds.length === 0) return initialTicketStore;

  const { [ticketId]: _removed, ...remainingTickets } = store.tickets;

  const newActiveTicketId =
    store.activeTicketId === ticketId
      ? remainingTicketIds[0]!
      : store.activeTicketId;

  return {
    ...store,
    tickets: remainingTickets,
    activeTicketId: newActiveTicketId,
    lastError: null,
  };
}

function updateTicketName(
  store: TicketStore,
  ticketId: string,
  newName: string,
): TicketStore {
  const trimmedName = newName.trim().slice(0, MAX_TICKET_NAME_LENGTH);

  if (!trimmedName) {
    return withError(store, "forms.ticket.name_required");
  }

  if (trimmedName === ticketId) return store;

  const ticket = store.tickets[ticketId];

  if (!ticket) return withError(store, "forms.ticket.not_found");

  if (store.tickets[trimmedName])
    return withError(store, "forms.ticket.name_taken");

  const { [ticketId]: _removed, ...restTickets } = store.tickets;

  return {
    ...store,
    activeTicketId:
      store.activeTicketId === ticketId ? trimmedName : store.activeTicketId,
    lastError: null,
    tickets: {
      ...restTickets,
      [trimmedName]: { ...ticket, id: trimmedName },
    },
  };
}

function setActiveTicket(store: TicketStore, ticketId: string): TicketStore {
  if (!store.tickets[ticketId])
    return withError(store, "forms.ticket.not_found");

  if (store.activeTicketId === ticketId) return store;

  return {
    ...store,
    activeTicketId: ticketId,
    lastError: null,
  };
}

function getActiveTicket(store: TicketStore): Ticket | null {
  return store.tickets[store.activeTicketId] ?? null;
}

// ---- Add ----
function addAdHocTicketItem(
  ticket: Ticket,
  newItem: NewAdHocTicketItem,
): Ticket {
  const item: AdHocTicketItem = {
    id: crypto.randomUUID(),
    type: "adHoc",
    name: newItem.name,
    quantity: newItem.quantity,
    priceSale: newItem.priceSale,
    originalPrice: newItem.originalPrice,
    wholesalePrice: newItem.wholesalePrice,
    conversionFactor: newItem.conversionFactor,
  };

  return {
    ...ticket,
    items: {
      ...ticket.items,
      [item.id]: item,
    },
  };
}

function addCatalogTicketItem(
  ticket: Ticket,
  newItem: NewCatalogTicketItem,
): { ticket: Ticket; error: TranslationKey | null } {
  const { product, presentationId } = newItem;

  const existingProductInTicket = ticket.products[product.id];
  const currentAvailableStock = existingProductInTicket
    ? existingProductInTicket.availableStock
    : product.availableStock;

  const totalQuantity = newItem.quantity * newItem.conversionFactor;

  if (!product.allowsNegativeStock && totalQuantity > currentAvailableStock) {
    return {
      ticket,
      error: "forms.ticket.product.insufficient_stock",
    };
  }

  const updatedProduct: ProductStore = existingProductInTicket
    ? {
        ...existingProductInTicket,
        availableStock: currentAvailableStock - totalQuantity,
      }
    : {
        id: product.id,
        stock: product.stock,
        minStock: product.minStock,
        allowsNegativeStock: product.allowsNegativeStock,
        availableStock: currentAvailableStock - totalQuantity,
        name: product.name,
      };

  const existingItem = Object.values(ticket.items).find(
    (item): item is CatalogTicketItem =>
      item.type === "catalog" && item.presentationId === presentationId,
  );

  const item: CatalogTicketItem = existingItem
    ? { ...existingItem, quantity: existingItem.quantity + newItem.quantity }
    : {
        id: crypto.randomUUID(),
        type: "catalog",
        presentationId,
        productId: product.id,
        name: product.name + ":" + newItem.name,
        quantity: newItem.quantity,
        priceSale: newItem.priceSale,
        originalPrice: newItem.originalPrice,
        wholesalePrice: newItem.wholesalePrice,
        conversionFactor: newItem.conversionFactor,
      };

  const newTicket: Ticket = {
    ...ticket,
    products: {
      ...ticket.products,
      [product.id]: updatedProduct,
    },
    items: {
      ...ticket.items,
      [item.id]: item,
    },
  };

  return { ticket: newTicket, error: null };
}

function addTicketItem(
  store: TicketStore,
  newItem: NewTicketItem,
): TicketStore {
  const ticket = getActiveTicket(store);

  if (!ticket) return withError(store, "forms.ticket.no_active_ticket");

  if (newItem.type === "adHoc") {
    const newTicket = addAdHocTicketItem(ticket, newItem);

    return {
      ...store,
      lastError: null,
      tickets: { ...store.tickets, [ticket.id]: newTicket },
    };
  }

  const { ticket: newTicket, error } = addCatalogTicketItem(ticket, newItem);

  if (error) return withError(store, error);

  return {
    ...store,
    lastError: null,
    tickets: { ...store.tickets, [ticket.id]: newTicket },
  };
}
// ---- End: Add ----

// ---- Delete ----
function deleteAdHocTicketItem(ticket: Ticket, itemId: string): Ticket {
  const { [itemId]: _removed, ...restItems } = ticket.items;

  return {
    ...ticket,
    items: restItems,
  };
}

function deleteCatalogTicketItem(
  ticket: Ticket,
  item: CatalogTicketItem,
): Ticket {
  const product = ticket.products[item.productId];
  const restoredQuantity = item.quantity * item.conversionFactor;

  const { [item.id]: _removed, ...restItems } = ticket.items;

  if (!product) return { ...ticket, items: restItems };

  const updatedProduct: ProductStore = {
    ...product,
    availableStock: product.availableStock + restoredQuantity,
  };

  return {
    ...ticket,
    items: restItems,
    products: {
      ...ticket.products,
      [product.id]: updatedProduct,
    },
  };
}

function deleteTicketItem(store: TicketStore, itemId: string): TicketStore {
  const ticket = getActiveTicket(store);

  if (!ticket) return withError(store, "forms.ticket.no_active_ticket");

  const item = ticket.items[itemId];

  if (!item) return withError(store, "forms.ticket.item.not_found");

  const newTicket =
    item.type === "adHoc"
      ? deleteAdHocTicketItem(ticket, itemId)
      : deleteCatalogTicketItem(ticket, item);

  return {
    ...store,
    lastError: null,
    tickets: { ...store.tickets, [ticket.id]: newTicket },
  };
}
// ---- End: Delete ----

// ---- Update ----
function updateAdHocTicketItem(
  ticket: Ticket,
  item: AdHocTicketItem,
  updates: TicketItemUpdate,
): Ticket {
  const updatedItem: AdHocTicketItem = { ...item, ...updates };

  return {
    ...ticket,
    items: {
      ...ticket.items,
      [item.id]: updatedItem,
    },
  };
}

function updateCatalogTicketItem(
  ticket: Ticket,
  item: CatalogTicketItem,
  updates: TicketItemUpdate,
): { ticket: Ticket; error: TranslationKey | null } {
  const product = ticket.products[item.productId];

  if (!product) return { ticket, error: "forms.ticket.product.not_found" };

  const newQuantity = updates.quantity ?? item.quantity;

  const quantityDelta = (newQuantity - item.quantity) * item.conversionFactor;
  const projectedAvailableStock = product.availableStock - quantityDelta;

  console.log(product.allowsNegativeStock, projectedAvailableStock);

  if (!product.allowsNegativeStock && projectedAvailableStock < 0)
    return {
      ticket,
      error: "forms.ticket.product.insufficient_stock",
    };

  console.log(product.allowsNegativeStock, projectedAvailableStock);

  const updatedProduct: ProductStore = {
    ...product,
    availableStock: projectedAvailableStock,
  };

  const updatedItem: CatalogTicketItem = { ...item, ...updates };

  const newTicket: Ticket = {
    ...ticket,
    products: {
      ...ticket.products,
      [product.id]: updatedProduct,
    },
    items: {
      ...ticket.items,
      [item.id]: updatedItem,
    },
  };

  return { ticket: newTicket, error: null };
}

function updateTicketItem(
  store: TicketStore,
  itemId: string,
  updates: TicketItemUpdate,
): TicketStore {
  if (updates.quantity === undefined && updates.priceSale === undefined)
    return store;

  // if (updates.quantity !== undefined && updates.quantity <= 0)
  //   return withError(store, "forms.ticket.item.quantity_required");

  // if (updates.priceSale !== undefined && updates.priceSale <= 0)
  //   return withError(store, "forms.ticket.item.price_sale_required");

  const ticket = getActiveTicket(store);

  if (!ticket) return withError(store, "forms.ticket.no_active_ticket");

  const item = ticket.items[itemId];

  if (!item) return withError(store, "forms.ticket.item.not_found");

  if (item.type === "adHoc") {
    const newTicket = updateAdHocTicketItem(ticket, item, updates);

    return {
      ...store,
      lastError: null,
      tickets: { ...store.tickets, [ticket.id]: newTicket },
    };
  }

  const { ticket: newTicket, error } = updateCatalogTicketItem(
    ticket,
    item,
    updates,
  );

  if (error) return withError(store, error);

  return {
    ...store,
    lastError: null,
    tickets: { ...store.tickets, [ticket.id]: newTicket },
  };
}
// ---- End: Update ----

// ---- Clear ----
function clearTicket(store: TicketStore): TicketStore {
  const ticket = getActiveTicket(store);

  if (!ticket) return withError(store, "forms.ticket.no_active_ticket");

  const clearedTicket: Ticket = {
    ...ticket,
    items: {},
    products: {},
  };

  return {
    ...store,
    lastError: null,
    tickets: { ...store.tickets, [ticket.id]: clearedTicket },
  };
}

function clearStore(): TicketStore {
  return initialTicketStore;
}
// ---- End: Clear ----

export const actions = {
  createTicket,
  deleteTicket,
  updateTicketName,
  setActiveTicket,
  addTicketItem,
  deleteTicketItem,
  updateTicketItem,
  clearTicket,
  clearStore,
  clearError,
  hydrate,
};

type ActionMap = typeof actions;

type ActionPayload<K extends keyof ActionMap> = ActionMap[K] extends (
  store: TicketStore,
  ...args: infer Rest
) => TicketStore
  ? Rest
  : never;

export type Action = {
  [K in keyof ActionMap]: ActionPayload<K> extends readonly []
    ? { type: K }
    : { type: K; payload: ActionPayload<K> };
}[keyof ActionMap];

export function ticketsReducer(
  state: TicketStore,
  action: Action,
): TicketStore {
  const fn = actions[action.type] as (
    store: TicketStore,
    ...args: unknown[]
  ) => TicketStore;

  const payload = "payload" in action ? action.payload : [];

  return fn(state, ...payload);
}
