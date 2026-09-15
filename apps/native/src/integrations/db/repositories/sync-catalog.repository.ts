import {
  type LocalCategory,
  type LocalProduct,
} from "@fludge/sync/entities/catalog.entities";
import type { LocalClientCatalogRepository as LCCR } from "@fludge/sync/repositories/catalog/client-catalog.repository";
import { DatabaseService } from "..";
import { category, product } from "@fludge/db/local-schemas/catalog.schema";
import { desc } from "drizzle-orm";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";

type AllItems = {
  products: LocalProduct[];
  categories: LocalCategory[];
};

export class LocalClientCatalogRepository implements LCCR {
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

  public async getLastSyncedAt(): Promise<{
    product: LocalProduct | null;
    category: LocalCategory | null;
  }> {
    const [product, category] = await Promise.all([
      this.getLastSyncedProduct(),
      this.getLastSyncedCategory(),
    ]);

    return {
      product,
      category,
    };
  }

  public async saveAll(values: AllItems): Promise<void> {
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
