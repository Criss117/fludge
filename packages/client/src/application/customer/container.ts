import type { ClientSyncCustomerRepository } from "@fludge/sync/repositories/customer/client-sync-customer.repository";

type Deps = {
  syncCustomerRepository: ClientSyncCustomerRepository;
};

export function generateCustomerContainer(deps: Deps) {
  return {
    repositories: {
      syncCustomerRepository: deps.syncCustomerRepository,
    },
  };
}

export type CustomerContainer = ReturnType<typeof generateCustomerContainer>;