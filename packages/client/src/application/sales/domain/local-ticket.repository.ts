import type {
  TicketProductPresentationSelect,
  TicketProductSelect,
  TicketSelect,
} from "@fludge/db/local-schemas/ticket.schema";

export type TicketProductPresentation = Omit<
  TicketProductPresentationSelect,
  "organizationId" | "ticketProductId"
>;

export type AddTicketProductBase = {
  readonly name: string;
  readonly stock: number;
  readonly minStock: number;
  readonly allowNegativeStock: boolean;
};

export type AddCatalogTicketProduct = AddTicketProductBase & {
  type: "catalog";
  productId: string;
  presentations: Array<
    Omit<TicketProductPresentation, "presentationId" | "id"> & {
      presentationId: string;
    }
  >;
};

export type AddAdHocTicketProduct = AddTicketProductBase & {
  type: "adHoc";
  productId: null;
  presentations: Array<
    Omit<TicketProductPresentation, "presentationId" | "id"> & {
      presentationId: null;
    }
  >;
};

export type AddTicketProduct = AddCatalogTicketProduct | AddAdHocTicketProduct;

export type TicketProduct = Omit<TicketProductSelect, "organizationId"> & {
  readonly name: string;
  readonly stock: number;
  readonly minStock: number;
  readonly allowNegativeStock: boolean;
  presentations: Array<TicketProductPresentation>;
};

export type Ticket = TicketSelect & {
  products: Array<TicketProduct>;
};

export interface LocalTicketRepository {
  load(organizationId: string): Promise<Ticket[]>;

  save(organizationId: string, tickets: Ticket[]): Promise<void>;

  clear(organizationId: string): Promise<void>;
}
