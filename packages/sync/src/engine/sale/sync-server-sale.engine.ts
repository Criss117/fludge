import type { ServerSyncSaleRepository } from "@fludge/sync/repositories/sale/server-sync-sale.repository";
import type { SaleLastSyncedAtQuery } from "@fludge/sync/types/sale.types";

export class SyncServerSaleEngine {
  constructor(
    private readonly serverSyncSaleRepository: ServerSyncSaleRepository,
  ) {}

  public async getLastSyncedAt(
    organizationIds: string[],
    lastSyncedAt: SaleLastSyncedAtQuery,
  ) {
    const { sales, saleItems } =
      await this.serverSyncSaleRepository.findAllItems(
        organizationIds,
        lastSyncedAt,
      );

    return {
      sales,
      saleItems,
    };
  }
}
