import { DatabaseService } from "..";
import { desc } from "drizzle-orm";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { ClientSyncSaleRepository } from "@fludge/sync/repositories/sale/client-sync-sale.repository";
import { localSale, localSaleItem } from "@fludge/db/local-schemas/shared.schema";
import type {
  SaleLastSyncedAtLocal,
  SaleSyncAllItems,
} from "@fludge/sync/types/sale.types";

export class NativeSyncSaleRepository implements ClientSyncSaleRepository {
  constructor(private readonly db: DatabaseService) {}

  private async getLastSyncedSale() {
    const row = await this.db
      .select()
      .from(localSale)
      .orderBy(desc(localSale.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  private async getLastSyncedSaleItem() {
    const row = await this.db
      .select()
      .from(localSaleItem)
      .orderBy(desc(localSaleItem.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  public async getLastSyncedAt(): Promise<SaleLastSyncedAtLocal> {
    const [sale, saleItem] = await Promise.all([
      this.getLastSyncedSale(),
      this.getLastSyncedSaleItem(),
    ]);

    return {
      sale,
      saleItem,
    };
  }

  public async saveAll(values: SaleSyncAllItems): Promise<void> {
    this.db.transaction((tx) => {
      if (values.sales.length > 0) {
        tx.insert(localSale)
          .values(values.sales)
          .onConflictDoUpdate({
            target: localSale.id,
            set: buildConflictUpdateColumn(localSale, [
              "saleNumber",
              "paymentType",
              "customerId",
              "completedAt",
              "cancelledAt",
              "total",
              "cancelReason",
              "notes",
              "status",
              "organizationId",
              "createdBy",
              "updatedAt",
            ]),
          })
          .run();
      }

      if (values.saleItems.length > 0) {
        tx.insert(localSaleItem)
          .values(values.saleItems)
          .onConflictDoUpdate({
            target: localSaleItem.id,
            set: buildConflictUpdateColumn(localSaleItem, [
              "saleId",
              "productPresentationId",
              "productPresentationName",
              "productPresentationPrice",
              "quantity",
              "subtotal",
              "organizationId",
              "updatedAt",
            ]),
          })
          .run();
      }
    });
  }
}
