import type { DatabaseService } from "@fludge/db";
import {
  category,
  product,
  productPresentation,
  type ProductPresentationSelect,
} from "@fludge/db/schema/catalog.schema";
import { jsonObject } from "@fludge/db/utils/build-queries";
import type {
  LocalCategory,
  LocalProduct,
} from "@fludge/sync/entities/catalog.entities";
import type { CatalogLastSyncedAt } from "@fludge/sync/repositories/catalog/client-sync-catalog.repository";
import type { ServerSyncCatalogRepository } from "@fludge/sync/repositories/catalog/server-sync-catalog.repository";
import { and, eq, getColumns, gt, inArray, sql } from "drizzle-orm";

export class SyncCatalogRepository implements ServerSyncCatalogRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findAllProducts(
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAt["product"],
  ) {
    const rows = await this.db
      .select({
        ...getColumns(product),
        presentations: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(productPresentation)}
            ) FILTER (WHERE ${productPresentation.productId} IS NOT NULL)
          `.as("presentations"),
      })
      .from(product)
      .innerJoin(
        productPresentation,
        eq(productPresentation.productId, product.id),
      )
      .where(
        and(
          inArray(product.organizationId, organizationIds),
          lastSyncedAt ? gt(product.updatedAt, lastSyncedAt) : undefined,
        ),
      )
      .groupBy(product.id);

    return rows.map((p) => {
      const presentations = (
        JSON.parse(p.presentations) as ProductPresentationSelect[]
      ).map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));

      return { ...p, presentations };
    });
  }

  public async findAllCategories(
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAt["category"],
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
    lastSyncedAt: CatalogLastSyncedAt,
  ): Promise<{
    products: LocalProduct[];
    categories: LocalCategory[];
  }> {
    const productsPromise = this.findAllProducts(
      organizationIds,
      lastSyncedAt.product,
    );

    const categoriesPromise = this.findAllCategories(
      organizationIds,
      lastSyncedAt.category,
    );

    const [products, categories] = await Promise.all([
      productsPromise,
      categoriesPromise,
    ]);

    return {
      products,
      categories,
    };
  }
}
