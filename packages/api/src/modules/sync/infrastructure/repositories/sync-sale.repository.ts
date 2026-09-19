import type { DatabaseService } from "@fludge/db";
import { sale, saleItem } from "@fludge/db/schema/sales.schema";
import type { ServerSyncSaleRepository } from "@fludge/sync/repositories/sale/server-sync-sale.repository";
import type {
  SaleLastSyncedAtQuery,
  SaleSyncAllItems,
} from "@fludge/sync/types/sale.types";
import { and, gt, inArray } from "drizzle-orm";

export class SyncSaleRepository implements ServerSyncSaleRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findAllSales(
    organizationIds: string[],
    lastSyncedAt: SaleLastSyncedAtQuery["sale"],
  ) {
    return this.db
      .select()
      .from(sale)
      .where(
        and(
          inArray(sale.organizationId, organizationIds),
          lastSyncedAt ? gt(sale.updatedAt, lastSyncedAt) : undefined,
        ),
      )
      .groupBy(sale.id);
  }

  public async findAllSaleItems(
    organizationIds: string[],
    lastSyncedAt: SaleLastSyncedAtQuery["saleItem"],
  ) {
    return this.db
      .select()
      .from(saleItem)
      .where(
        and(
          inArray(saleItem.organizationId, organizationIds),
          lastSyncedAt ? gt(saleItem.updatedAt, lastSyncedAt) : undefined,
        ),
      )
      .groupBy(saleItem.id);
  }

  public async findAllItems(
    organizationIds: string[],
    lastSyncedAt: SaleLastSyncedAtQuery,
  ): Promise<SaleSyncAllItems> {
    const [sales, saleItems] = await Promise.all([
      this.findAllSales(organizationIds, lastSyncedAt.sale),
      this.findAllSaleItems(organizationIds, lastSyncedAt.saleItem),
    ]);

    return {
      sales,
      saleItems,
    };
  }
}
