import type { ServerSyncCustomerRepository } from "@fludge/sync/repositories/customer/server-sync-customer.repository";
import type { CustomerLastSyncedAtQuery } from "@fludge/sync/types/customer.types";

export class SyncServerCustomerEngine {
  constructor(
    private readonly serverSyncCustomerRepository: ServerSyncCustomerRepository,
  ) {}

  public async getLastSyncedAt(
    organizationIds: string[],
    lastSyncedAt: CustomerLastSyncedAtQuery,
  ) {
    const { customers } =
      await this.serverSyncCustomerRepository.findAllItems(
        organizationIds,
        lastSyncedAt,
      );

    return {
      customers,
    };
  }
}