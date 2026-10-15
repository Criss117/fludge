import type {
  TicketProductPresentation,
  TicketProductSelect,
  TicketSelect,
} from "@fludge/db/local-schemas/ticket.schema";

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

export type TicketProduct = TicketProductSelect & {
  name: string;
  stock: number;
  minStock: number;
  allowNegativeStock: boolean;
};

export type Ticket = TicketSelect & {
  items: Array<TicketProduct>;
};

export interface LocalTicketRepository {
  load(organizationId: string): Promise<Ticket[]>;

  save(organizationId: string, tickets: Ticket[]): Promise<void>;

  clear(organizationId: string): Promise<void>;

  clearAll(): Promise<void>;
}
