import { DatabaseService } from "..";
import { desc } from "drizzle-orm";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { ClientSyncCatalogRepository } from "@fludge/sync/repositories/catalog/client-sync-catalog.repository";
import {
  localCategory,
  localProduct,
  localProductPresentation,
} from "@fludge/db/local-schemas/shared.schema";
import {
  CatalogSyncResult,
  CatalogLastSyncedAt,
} from "@fludge/sync/types/catalog.types";
import { NativeProductRepository } from "@/modules/catalog/repositories/native-product.repository";
import { NativeCategoryRepository } from "@/modules/catalog/repositories/native-category.repository";

export class NativeSyncCatalogRepository implements ClientSyncCatalogRepository {
  constructor(
    private readonly db: DatabaseService,
    private readonly productRepository: NativeProductRepository,
    private readonly categoryRepository: NativeCategoryRepository
  ) {}

  public async saveAll(values: CatalogSyncResult): Promise<void> {
    await this.categoryRepository.save(values.categories);
    await this.productRepository.save(values.products);
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
