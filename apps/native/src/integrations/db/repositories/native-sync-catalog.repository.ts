import { DatabaseService } from "..";
import { category, product } from "@fludge/db/local-schemas/catalog.schema";
import { desc } from "drizzle-orm";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type {
  ClientSyncCatalogRepository,
  GetCatalogLastSyncedAt,
} from "@fludge/sync/repositories/catalog/client-sync-catalog.repository";
import { SyncCatalogAllItems } from "@fludge/sync/repositories/catalog/server-sync-catalog.repository";

export class NativeSyncCatalogRepository implements ClientSyncCatalogRepository {
  constructor(private readonly db: DatabaseService) {}

  private async getLastSyncedProduct() {
    const row = await this.db
      .select()
      .from(product)
      .orderBy(desc(product.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  private async getLastSyncedCategory() {
    const row = await this.db
      .select()
      .from(category)
      .orderBy(desc(category.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  public async getLastSyncedAt(): Promise<GetCatalogLastSyncedAt> {
    const [product, category] = await Promise.all([
      this.getLastSyncedProduct(),
      this.getLastSyncedCategory(),
    ]);

    return {
      product,
      category,
    };
  }

  public async saveAll(values: SyncCatalogAllItems): Promise<void> {
    this.db.transaction((tx) => {
      if (values.products.length > 0) {
        tx.insert(product)
          .values(values.products)
          .onConflictDoUpdate({
            target: product.id,
            set: buildConflictUpdateColumn(product, [
              "allowNegativeStock",
              "categoryId",
              "description",
              "minStock",
              "name",
              "presentations",
              "searchBlob",
              "slug",
              "status",
              "stock",
              "updatedAt",
            ]),
          })
          .run();
      }

      if (values.categories.length > 0) {
        tx.insert(category)
          .values(values.categories)
          .onConflictDoUpdate({
            target: category.id,
            set: buildConflictUpdateColumn(category, [
              "description",
              "name",
              "slug",
              "status",
              "updatedAt",
            ]),
          })
          .run();
      }
    });
  }
}
