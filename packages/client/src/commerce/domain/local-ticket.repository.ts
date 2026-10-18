import type {
  TicketProductPresentation,
  TicketProductSelect,
  TicketSelect,
} from "@fludge/db/local-schemas/ticket.schema";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Result } from "@fludge/utils/trycatch";

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
  load(organizationId: string): Promise<Result<Ticket[], RepositoryError>>;

  save(organizationId: string, tickets: Ticket[]): Promise<Result<void, RepositoryError>>;

  clear(organizationId: string): Promise<Result<void, RepositoryError>>;

  clearAll(): Promise<Result<void, RepositoryError>>;
}
