import { DatabaseService } from "..";
import { desc } from "drizzle-orm";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { ClientSyncCatalogRepository } from "@fludge/sync/repositories/catalog/client-sync-catalog.repository";
import {
  localCategory,
  localProduct,
  localProductPresentation,
} from "@fludge/db/local-schemas/shared.schema";
import type {
  CatalogLastSyncedAtLocal,
  CatalogSyncAllItems,
} from "@fludge/sync/types/catalog.types";

export class NativeSyncCatalogRepository implements ClientSyncCatalogRepository {
  constructor(private readonly db: DatabaseService) {}

  private async getLastSyncedProduct() {
    const row = await this.db
      .select()
      .from(localProduct)
      .orderBy(desc(localProduct.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  private async getLastSyncedCategory() {
    const row = await this.db
      .select()
      .from(localCategory)
      .orderBy(desc(localCategory.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  private async getLastSyncedProductPresentation() {
    const row = await this.db
      .select()
      .from(localProductPresentation)
      .orderBy(desc(localProductPresentation.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  public async getLastSyncedAt(): Promise<CatalogLastSyncedAtLocal> {
    const [product, category, productPresentation] = await Promise.all([
      this.getLastSyncedProduct(),
      this.getLastSyncedCategory(),
      this.getLastSyncedProductPresentation(),
    ]);

    return {
      product,
      category,
      productPresentation,
    };
  }

  public async saveAll(values: CatalogSyncAllItems): Promise<void> {
    this.db.transaction((tx) => {
      if (values.categories.length > 0) {
        tx.insert(localCategory)
          .values(values.categories)
          .onConflictDoUpdate({
            target: localCategory.id,
            set: buildConflictUpdateColumn(localCategory, [
              "description",
              "name",
              "slug",
              "status",
              "updatedAt",
            ]),
          })
          .run();
      }

      if (values.products.length > 0) {
        tx.insert(localProduct)
          .values(values.products)
          .onConflictDoUpdate({
            target: localProduct.id,
            set: buildConflictUpdateColumn(localProduct, [
              "allowNegativeStock",
              "categoryId",
              "description",
              "minStock",
              "name",
              "searchBlob",
              "slug",
              "status",
              "stock",
              "updatedAt",
            ]),
          })
          .run();
      }

      if (values.productPresentations.length > 0) {
        tx.insert(localProductPresentation)
          .values(values.productPresentations)
          .onConflictDoUpdate({
            target: localProductPresentation.id,
            set: buildConflictUpdateColumn(localProductPresentation, [
              "barcode",
              "conversionFactor",
              "name",
              "pricePurchase",
              "priceSale",
              "priceWholesale",
              "searchBlob",
              "status",
              "updatedAt",
            ]),
          })
          .run();
      }
    });
  }
}
