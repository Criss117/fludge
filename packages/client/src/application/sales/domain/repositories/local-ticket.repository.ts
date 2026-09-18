import type {
  TicketProductPresentationSelect,
  TicketProductSelect,
  TicketSelect,
} from "@fludge/db/local-schemas/ticket.schema";

export type AddTicketProductBase = {
  readonly stock: number;
  readonly minStock: number;
  readonly allowsNegativeStock: boolean;
};

export type AddCatalogTicketProduct = AddTicketProductBase & {
  type: "catalog";
  productId: string;
  presentations: Array<
    Omit<TicketProductPresentationSelect, "presentationId"> & {
      presentationId: string;
    }
  >;
};

export type AddAdHocTicketProduct = AddTicketProductBase & {
  type: "adHoc";
  productId: null;
  presentations: Array<
    Omit<TicketProductPresentationSelect, "presentationId"> & {
      presentationId: null;
    }
  >;
};

export type AddTicketProduct = AddCatalogTicketProduct | AddAdHocTicketProduct;

export type TicketProduct = TicketProductSelect & {
  readonly stock: number;
  readonly minStock: number;
  readonly allowsNegativeStock: boolean;
  presentations: Array<TicketProductPresentationSelect>;
};

export type Ticket = TicketSelect & {
  products: Array<TicketProduct>;
};

export interface LocalTicketRepository {
  load(organizationId: string): Promise<Ticket[]>;
  save(organizationId: string, tickets: Ticket[]): Promise<Ticket[]>;
  clear(organizationId: string): Promise<void>;
}
