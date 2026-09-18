import type { LocalTicketRepository } from "./domain/repositories/local-ticket.repository";

type Deps = {
  localTicketRepository: LocalTicketRepository;
};

export function generateSaleContainer(deps: Deps) {
  return {
    localTicketRepository: deps.localTicketRepository,
  };
}

export type SalesContainer = ReturnType<typeof generateSaleContainer>;
