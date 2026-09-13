type TicketItemBase = {
  readonly id: string;
  readonly name: string;
  quantity: number;

  priceSale: number;
  readonly originalPrice: number;
  readonly wholesalePrice: number | null;
  readonly conversionFactor: number;
};

export type AdHocTicketItem = TicketItemBase & {
  readonly type: "adHoc";
};

export type CatalogTicketItem = TicketItemBase & {
  readonly type: "catalog";
  readonly presentationId: string;
  readonly productId: string;
};

export type TicketItem = AdHocTicketItem | CatalogTicketItem;

export type ProductStore = {
  readonly id: string;
  readonly stock: number;
  readonly minStock: number;
  readonly allowsNegativeStock: boolean;
  readonly name: string;
  availableStock: number;
};

export type Ticket = {
  readonly id: string;
  items: Record<string, TicketItem>;
  products: Record<string, ProductStore>;
};

export type TicketStore = {
  tickets: Record<string, Ticket>;
  activeTicketId: string;
  lastError: string | null;
};

const initialTicket: Ticket = {
  id: "Ticket 1",
  items: {},
  products: {},
};

export const initialTicketStore: TicketStore = {
  tickets: {
    [initialTicket.id]: initialTicket,
  },
  activeTicketId: initialTicket.id,
  lastError: null,
};

type NewTicketItemBase = {
  name: string;
  quantity: number;

  priceSale: number;
  originalPrice: number;
  wholesalePrice: number | null;
  conversionFactor: number;
};

export type NewAdHocTicketItem = NewTicketItemBase & {
  type: "adHoc";
};

export type NewCatalogTicketItem = NewTicketItemBase & {
  type: "catalog";
  presentationId: string;
  product: ProductStore;
};

export type NewTicketItem = NewAdHocTicketItem | NewCatalogTicketItem;

export type TicketItemUpdate = {
  quantity?: number;
  priceSale?: number;
};
