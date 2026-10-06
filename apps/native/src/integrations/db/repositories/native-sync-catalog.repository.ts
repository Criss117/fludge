import { DatabaseService } from "..";
import { desc, inArray } from "drizzle-orm";
import type { ClientSyncCatalogRepository } from "@fludge/sync/repositories/catalog/client-sync-catalog.repository";
import {
  localCategory,
  localProduct,
  localProductPresentation,
  type LocalProduct,
} from "@fludge/db/local-schemas/shared.schema";
import {
  CatalogSyncResult,
  CatalogLastSyncedAt,
} from "@fludge/sync/types/catalog.types";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { TransactionService } from "@/integrations/db/index";

export class NativeSyncCatalogRepository implements ClientSyncCatalogRepository {
  constructor(private readonly db: DatabaseService) {}

  private async saveProducts(
    values: CatalogSyncResult["products"],
    tx: TransactionService,
  ) {
    const productsArray = Array.isArray(values) ? values : [values];

    const productsValues: Omit<LocalProduct, "presentations">[] = [];
    const presentationsValues: LocalProduct["presentations"] = [];

    for (const product of productsArray) {
      const { presentations, ...productValues } = product;

      productsValues.push(productValues);

      for (const presentation of presentations) {
        presentationsValues.push(presentation);
      }
    }

    if (productsValues.length > 0) {
      tx.insert(localProduct)
        .values(productsValues)
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

    if (presentationsValues.length > 0) {
      tx.delete(localProductPresentation)
        .where(
          inArray(
            localProductPresentation.productId,
            productsValues.map((p) => p.id),
          ),
        )
        .run();

      tx.insert(localProductPresentation).values(presentationsValues).run();
    }
  }

  private async saveCategories(
    values: CatalogSyncResult["categories"],
    tx: TransactionService,
  ) {
    const categoriesArray = Array.isArray(values) ? values : [values];

    if (categoriesArray.length === 0) return;

    tx.insert(localCategory)
      .values(categoriesArray)
      .onConflictDoUpdate({
        target: localCategory.id,
        set: buildConflictUpdateColumn(localCategory, [
          "name",
          "slug",
          "status",
          "description",
        ]),
      })
      .run();
  }

  public async saveAll(values: CatalogSyncResult): Promise<void> {
    this.db.transaction((tx) => {
      this.saveCategories(values.categories, tx);
      this.saveProducts(values.products, tx);
    });
  }

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

  public async getLastSyncedAt(): Promise<CatalogLastSyncedAt> {
    const [product, category] = await Promise.all([
      this.getLastSyncedProduct(),
      this.getLastSyncedCategory(),
      this.getLastSyncedProductPresentation(),
    ]);

    return {
      product: product?.updatedAt ?? null,
      category: category?.updatedAt ?? null,
    };
  }
}
