import type { DatabaseService } from "@fludge/db";
import {
  category,
  product,
  productPresentation,
  type ProductPresentationSelect,
} from "@fludge/db/schema/catalog.schema";
import { jsonObject } from "@fludge/db/utils/build-queries";
import type { ServerSyncCatalogRepository } from "@fludge/sync/repositories/catalog/server-sync-catalog.repository";
import type {
  CatalogLastSyncedAt,
  CatalogSyncResult,
} from "@fludge/sync/types/catalog.types";
import { and, desc, getColumns, gt, inArray, sql } from "drizzle-orm";

export class SqliteSyncCatalogRepository implements ServerSyncCatalogRepository {
  constructor(private readonly db: DatabaseService) {}

  private async findCategories(
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
      )
      .orderBy(desc(category.updatedAt));
  }

  private async findProducts(
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
      .where(
        and(
          inArray(product.organizationId, organizationIds),
          lastSyncedAt ? gt(product.updatedAt, lastSyncedAt) : undefined,
        ),
      )
      .orderBy(desc(product.updatedAt))
      .groupBy(product.id);

    return rows.map((p) => {
      const presentations = (
        JSON.parse(p.presentations) as ProductPresentationSelect[]
      ).map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));

      return {
        ...p,
        presentations,
      };
    });
  }

  public async findAllItems(
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAt,
  ): Promise<CatalogSyncResult> {
    const [categories, products] = await Promise.all([
      this.findCategories(organizationIds, lastSyncedAt.category),
      this.findProducts(organizationIds, lastSyncedAt.product),
    ]);

    return {
      categories,
      products,
    };
  }
}
