import type { DatabaseService } from "@fludge/db";
import {
  category,
  product,
  productPresentation,
} from "@fludge/db/schema/catalog.schema";
import type { ServerSyncCatalogRepository } from "@fludge/sync/repositories/catalog/server-sync-catalog.repository";
import type {
  CatalogLastSyncedAtQuery,
  CatalogSyncAllItems,
} from "@fludge/sync/types/catalog.types";
import { and, gt, inArray } from "drizzle-orm";

export class SyncCatalogRepository implements ServerSyncCatalogRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findAllProducts(
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAtQuery["product"],
  ) {
    return this.db
      .select()
      .from(product)

      .where(
        and(
          inArray(product.organizationId, organizationIds),
          lastSyncedAt ? gt(product.updatedAt, lastSyncedAt) : undefined,
        ),
      )
      .groupBy(product.id);
  }

  public async findAllProductPresentations(
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAtQuery["productPresentation"],
  ) {
    return this.db
      .select()
      .from(productPresentation)
      .where(
        and(
          inArray(productPresentation.organizationId, organizationIds),
          lastSyncedAt
            ? gt(productPresentation.updatedAt, lastSyncedAt)
            : undefined,
        ),
      );
  }

  public async findAllCategories(
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAtQuery["category"],
  ) {
    return this.db
      .select()
      .from(category)
      .where(
        and(
          inArray(category.organizationId, organizationIds),
          lastSyncedAt ? gt(category.updatedAt, lastSyncedAt) : undefined,
        ),
      );
  }

  public async findAllItems(
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAtQuery,
  ): Promise<CatalogSyncAllItems> {
    const productsPromise = this.findAllProducts(
      organizationIds,
      lastSyncedAt.product,
    );

    const categoriesPromise = this.findAllCategories(
      organizationIds,
      lastSyncedAt.category,
    );

    const productPresentationsPromise = this.findAllProductPresentations(
      organizationIds,
      lastSyncedAt.productPresentation,
    );

    const [products, productPresentations, categories] = await Promise.all([
      productsPromise,
      productPresentationsPromise,
      categoriesPromise,
    ]);

    return {
      products,
      categories,
      productPresentations,
    };
  }
}
