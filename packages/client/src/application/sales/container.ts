import type { ClientSyncSaleRepository } from "@fludge/sync/repositories/sale/client-sync-sale.repository";
import type { LocalTicketRepository } from "./domain/local-ticket.repository";
import type { SaleRepository } from "./domain/sale.repository";

type Deps = {
  localTicketRepository: LocalTicketRepository;
  syncSaleRepository: ClientSyncSaleRepository;
  saleRepository: SaleRepository;
};

export function generateSaleContainer(deps: Deps) {
  return {
    localTicketRepository: deps.localTicketRepository,
    syncSaleRepository: deps.syncSaleRepository,
    saleRepository: deps.saleRepository,
  };
}

export type SalesContainer = ReturnType<typeof generateSaleContainer>;
