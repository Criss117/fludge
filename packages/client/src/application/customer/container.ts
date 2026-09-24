import type { ClientSyncCommerceRepository } from "@fludge/sync/repositories/commerse/client-sync-commerce.repository";
import type { CustomerRepository } from "./domain/customer.repository";

type Deps = {
  customerRepository: CustomerRepository;
  syncCommerceRepository: ClientSyncCommerceRepository;
};

export function generateCustomerContainer(deps: Deps) {
  return {
    repositories: {
      customerRepository: deps.customerRepository,
      syncCommerceRepository: deps.syncCommerceRepository,
    },
  };
}

export type CustomerContainer = ReturnType<typeof generateCustomerContainer>;
