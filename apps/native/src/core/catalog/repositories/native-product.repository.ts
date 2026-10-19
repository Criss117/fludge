import type { ProductDetail } from "@fludge/client/catalog/domain/entities";
import type { ProductRepository } from "@fludge/client/catalog/domain/product.repository";
import type { Filters } from "@fludge/client/shared/use-filters";
import type { LocalProduct } from "@fludge/db/local-schemas/shared.schema";
import { localProduct, localProductPresentation } from "@fludge/db/local-schemas/shared.schema";
import { buildConflictUpdateColumn, jsonObject } from "@fludge/db/utils/build-queries";
import { type RepositoryError, toRepositoryError } from "@fludge/utils/errors/repository.error";
import { type Cursor, paginate, type PaginatedResponse } from "@fludge/utils/pagination";
import { type Result, tryCatch } from "@fludge/utils/trycatch";
import { and, asc, desc, eq, getColumns, inArray, like, or, sql } from "drizzle-orm";

import type { DatabaseService } from "@/integrations/db";

export class NativeProductRepository implements ProductRepository {
  constructor(private readonly db: DatabaseService) {}

  public async clearAll(): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        this.db.transaction((tx) => {
          tx.delete(localProductPresentation).run();
          tx.delete(localProduct).run();
        });
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.products.isr_on_delete", raw),
      },
    );
  }

  public async findAll(
    organizationId: string,
    cursor: Cursor,
    filters: Filters,
  ): Promise<Result<PaginatedResponse<ProductDetail>, RepositoryError>> {
    return tryCatch(
      () => {
        const orderByFilters =
          filters.orderBy
            ?.filter((o) => o.direction !== "none")
            .map((orderBy) => {
              const column = localProduct[orderBy.field];

              return orderBy.direction === "asc" ? asc(column) : desc(column);
            }) ?? [];

        const rows = this.db
          .select({
            ...getColumns(localProduct),
            presentations: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(localProductPresentation)}
            ) FILTER (WHERE ${localProductPresentation.productId} IS NOT NULL)
          `.as("presentations"),
          })
          .from(localProduct)
          .innerJoin(
            localProductPresentation,
            eq(localProduct.id, localProductPresentation.productId),
          )
          .where(
            and(
              eq(localProduct.organizationId, organizationId),
              or(
                like(localProduct.name, `%${filters.searchQuery}%`),
                like(localProduct.searchBlob, `%${filters.searchQuery}%`),
              ),
              filters.status !== "all" ? eq(localProduct.status, filters.status) : undefined,
            ),
          )
          .limit(cursor.limit + 1)
          .offset(cursor.limit * cursor.page)
          .groupBy(localProduct.id)
          .orderBy(...orderByFilters)
          .all();

        return paginate(
          rows.map((p) => {
            const presentations = (
              JSON.parse(p.presentations) as LocalProduct["presentations"]
            ).map((p) => ({
              ...p,
              createdAt: new Date(p.createdAt),
              updatedAt: new Date(p.updatedAt),
            }));

            return {
              ...p,
              presentations,
            };
          }),
          cursor,
        );
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.products.isr_on_find", raw),
      },
    );
  }

  public async findOneById(
    organizationId: string,
    productId: string,
  ): Promise<Result<ProductDetail | null, RepositoryError>> {
    return tryCatch(
      () => {
        const row = this.db
          .select()
          .from(localProduct)
          .where(
            and(eq(localProduct.organizationId, organizationId), eq(localProduct.id, productId)),
          )
          .limit(1)
          .get();

        if (!row) return null;

        const presentations = this.db
          .select()
          .from(localProductPresentation)
          .where(eq(localProductPresentation.productId, productId))
          .orderBy(desc(localProductPresentation.createdAt))
          .all();

        return {
          ...row,
          presentations,
        };
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.products.isr_on_find", raw),
      },
    );
  }

  public async save(
    productValues: ProductDetail | ProductDetail[],
  ): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        const productsArray = Array.isArray(productValues) ? productValues : [productValues];

        const productsValues: Omit<LocalProduct, "presentations">[] = [];
        const presentationsValues: LocalProduct["presentations"] = [];

        for (const product of productsArray) {
          const { presentations, ...productValues } = product;

          productsValues.push(productValues);

          for (const presentation of presentations) {
            presentationsValues.push(presentation);
          }
        }

        this.db.transaction((tx) => {
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
        });
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.products.isr_on_save", raw),
      },
    );
  }

  public async delete(
    organizationId: string,
    productId: string | string[],
  ): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        const productIds = Array.isArray(productId) ? productId : [productId];

        this.db.transaction((tx) => {
          tx.delete(localProductPresentation)
            .where(
              and(
                eq(localProductPresentation.organizationId, organizationId),
                inArray(localProductPresentation.productId, productIds),
              ),
            )
            .run();

          tx.delete(localProduct)
            .where(
              and(
                eq(localProduct.organizationId, organizationId),
                inArray(localProduct.id, productIds),
              ),
            )
            .run();
        });
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.products.isr_on_delete", raw),
      },
    );
  }
}
