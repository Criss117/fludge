import type { DatabaseService } from "@fludge/db";
import type {
  LocalCategory,
  LocalProduct,
} from "@fludge/db/local-schemas/shared.schema";
import {
  category,
  product,
  productPresentation,
  type ProductPresentationSelect,
} from "@fludge/db/schema/catalog.schema";
import { jsonObject } from "@fludge/db/utils/build-queries";
import type { ServerSyncCatalogRepository } from "@fludge/sync/repositories/catalog/server-sync-catalog.repository";
import type {
  CatalogSyncCursors,
  CatalogSyncResult,
} from "@fludge/sync/types/catalog.types";
import {
  paginateSync,
  type PaginateSyncQueryFn,
  type SyncCursor,
} from "@fludge/sync/types/shared.types";
import { and, asc, eq, getColumns, gt, inArray, or, sql } from "drizzle-orm";

const after = <T extends { updatedAt: any; id: any }>(
  t: T,
  c: SyncCursor | null,
) =>
  c
    ? or(
        gt(t.updatedAt, c.updatedAt),
        and(eq(t.updatedAt, c.updatedAt), gt(t.id, c.id)),
      )
    : undefined;

export class SqliteSyncCatalogRepository implements ServerSyncCatalogRepository {
  constructor(private readonly db: DatabaseService) {}

  private findCategories(
    organizationIds: string[],
  ): PaginateSyncQueryFn<LocalCategory> {
    return (cursor, limit) =>
      this.db
        .select()
        .from(category)
        .where(
          and(
            inArray(category.organizationId, organizationIds),
            after(category, cursor),
          ),
        )
        .limit(limit)
        .orderBy(asc(category.updatedAt), asc(category.id));
  }

  private findProducts(
    organizationIds: string[],
  ): PaginateSyncQueryFn<LocalProduct> {
    return async (cursor, limit) => {
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
        .leftJoin(
          productPresentation,
          and(
            eq(productPresentation.productId, product.id),
            eq(productPresentation.organizationId, product.organizationId),
          ),
        )
        .where(
          and(
            inArray(product.organizationId, organizationIds),
            after(product, cursor),
          ),
        )
        .limit(limit)
        .orderBy(asc(product.updatedAt), asc(product.id))
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
    };
  }

  public async findAllItems(
    organizationIds: string[],
    lastSyncedAt: CatalogSyncCursors,
    limit = 500,
  ): Promise<CatalogSyncResult> {
    const [categories, products] = await Promise.all([
      paginateSync(
        this.findCategories(organizationIds),
        lastSyncedAt.category,
        limit,
      ),
      paginateSync(
        this.findProducts(organizationIds),
        lastSyncedAt.product,
        limit,
      ),
    ]);

    return {
      categories,
      products,
    };
  }
}
