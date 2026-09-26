import type { ClientSyncCommerceRepository } from "@fludge/sync/repositories/commerse/client-sync-commerce.repository";
import type { CustomerRepository } from "./domain/customer.repository";
import type { LocalTicketRepository } from "./domain/local-ticket.repository";
import type { SaleRepository } from "./domain/sale.repository";

type Deps = {
  customerRepository: CustomerRepository;
  saleRepository: SaleRepository;
  localTicketRepository: LocalTicketRepository;
  syncCommerceRepository: ClientSyncCommerceRepository;
};

export function generateCommerceContainer(deps: Deps) {
  return {
    repositories: {
      customerRepository: deps.customerRepository,
      saleRepository: deps.saleRepository,
      localTicketRepository: deps.localTicketRepository,
      syncCommerceRepository: deps.syncCommerceRepository,
    },
  };
}

export type CommerceContainer = ReturnType<typeof generateCommerceContainer>;