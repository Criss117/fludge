import type { ClientSyncSaleRepository } from "@fludge/sync/repositories/sale/client-sync-sale.repository";
import type { LocalTicketRepository } from "./domain/local-ticket.repository";

type Deps = {
  localTicketRepository: LocalTicketRepository;
  syncSaleRepository: ClientSyncSaleRepository;
};

export function generateSaleContainer(deps: Deps) {
  return {
    localTicketRepository: deps.localTicketRepository,
    syncSaleRepository: deps.syncSaleRepository,
  };
}

export type SalesContainer = ReturnType<typeof generateSaleContainer>;
