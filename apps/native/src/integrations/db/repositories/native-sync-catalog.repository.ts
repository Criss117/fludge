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
  CatalogSyncCursors,
} from "@fludge/sync/types/catalog.types";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { TransactionService } from "@/integrations/db/index";
import type { NativeSyncStateRepository } from "./native-sync-state.repository";

export class NativeSyncCatalogRepository implements ClientSyncCatalogRepository {
  constructor(
    private readonly db: DatabaseService,
    private readonly syncStateRepository: NativeSyncStateRepository,
  ) {}

  private async saveProducts(
    values: CatalogSyncResult["products"],
    tx: TransactionService,
  ) {
    const productsList: Omit<LocalProduct, "presentations">[] = [];
    const presentationsList: LocalProduct["presentations"] = [];

    for (const product of values.items) {
      const { presentations, ...productValues } = product;

      productsList.push(productValues);

      for (const presentation of presentations) {
        presentationsList.push(presentation);
      }
    }

    if (productsList.length > 0) {
      tx.insert(localProduct)
        .values(productsList)
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

    if (presentationsList.length > 0) {
      tx.delete(localProductPresentation)
        .where(
          inArray(
            localProductPresentation.productId,
            productsList.map((p) => p.id),
          ),
        )
        .run();

      tx.insert(localProductPresentation).values(presentationsList).run();
    }

    this.syncStateRepository.save("products", values.nextCursor, tx);
  }

  private async saveCategories(
    values: CatalogSyncResult["categories"],
    tx: TransactionService,
  ) {
    if (values.items.length === 0) return;

    tx.insert(localCategory)
      .values(values.items)
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

    this.syncStateRepository.save("categories", values.nextCursor, tx);
  }

  public async saveAll(values: CatalogSyncResult): Promise<void> {
    this.db.transaction((tx) => {
      this.saveCategories(values.categories, tx);
      this.saveProducts(values.products, tx);
    });
  }

  public async getLastSyncedAt(): Promise<CatalogSyncCursors> {
    const [product, category] = await Promise.all([
      this.syncStateRepository.find("products"),
      this.syncStateRepository.find("categories"),
    ]);

    return {
      product: product?.cursor ?? null,
      category: category?.cursor ?? null,
    };
  }
}
