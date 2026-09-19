import type { ClientSyncCustomerRepository } from "@fludge/sync/repositories/customer/client-sync-customer.repository";
import type { CustomerRepository } from "./domain/customer.repository";

type Deps = {
  customerRepository: CustomerRepository;
  syncCustomerRepository: ClientSyncCustomerRepository;
};

export function generateCustomerContainer(deps: Deps) {
  return {
    repositories: {
      customerRepository: deps.customerRepository,
      syncCustomerRepository: deps.syncCustomerRepository,
    },
  };
}

export type CustomerContainer = ReturnType<typeof generateCustomerContainer>;