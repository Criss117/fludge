import {
  localCategory,
  type LocalProduct,
  localProduct,
  localProductPresentation,
} from "@fludge/db/local-schemas/shared.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { ClientSyncCatalogRepository } from "@fludge/sync/repositories/catalog/client-sync-catalog.repository";
import type { CatalogSyncCursors, CatalogSyncResult } from "@fludge/sync/types/catalog.types";
import { type RepositoryError, toRepositoryError } from "@fludge/utils/errors/repository.error";
import { type Result, tryCatch, unwrapResult } from "@fludge/utils/trycatch";
import { inArray } from "drizzle-orm";

import type { DatabaseService, TransactionService } from "@/integrations/db/index";

import type { NativeSyncStateRepository } from "./native-sync-state.repository";

export class NativeSyncCatalogRepository implements ClientSyncCatalogRepository {
  constructor(
    private readonly db: DatabaseService,
    private readonly syncStateRepository: NativeSyncStateRepository,
  ) {}

  private saveProducts(values: CatalogSyncResult["products"], tx: TransactionService) {
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

    unwrapResult(this.syncStateRepository.save("products", values.nextCursor, tx));
  }

  private saveCategories(values: CatalogSyncResult["categories"], tx: TransactionService) {
    if (values.items.length === 0) return;

    tx.insert(localCategory)
      .values(values.items)
      .onConflictDoUpdate({
        target: localCategory.id,
        set: buildConflictUpdateColumn(localCategory, ["name", "slug", "status", "description"]),
      })
      .run();

    unwrapResult(this.syncStateRepository.save("categories", values.nextCursor, tx));
  }

  public async saveAll(values: CatalogSyncResult): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        this.db.transaction((tx) => {
          this.saveCategories(values.categories, tx);
          this.saveProducts(values.products, tx);
        });
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.products.isr_on_save", raw),
      },
    );
  }

  public async getLastSyncedAt(): Promise<Result<CatalogSyncCursors, RepositoryError>> {
    return tryCatch(
      async () => {
        const [product, category] = await Promise.all([
          this.syncStateRepository.find("products"),
          this.syncStateRepository.find("categories"),
        ]);

        return {
          product: unwrapResult(product)?.cursor ?? null,
          category: unwrapResult(category)?.cursor ?? null,
        };
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.products.isr_on_find", raw),
      },
    );
  }
}
