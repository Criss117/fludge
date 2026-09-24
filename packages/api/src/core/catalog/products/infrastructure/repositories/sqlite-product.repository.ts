import { Product } from "@fludge/api/core/catalog/products/domain/entities/product.entity";
import type {
  Options,
  ProductRepository,
} from "@fludge/api/core/catalog/products/domain/repositories/product.repository";
import { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";
import type { DatabaseService } from "@fludge/db";
import {
  product,
  productPresentation,
  type ProductPresentationSelect,
} from "@fludge/db/schema/catalog.schema";
import {
  buildConflictUpdateColumn,
  jsonObject,
} from "@fludge/db/utils/build-queries";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, getColumns, inArray, sql } from "drizzle-orm";

export class SQLiteProductRepository
  extends TransactionalRepository
  implements ProductRepository
{
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  private async find(
    organizationId: string,
    filter: { id?: string; ids?: string[] },
  ) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          ...getColumns(product),
          presentations: sql<string>`
            json_group_array(
              ${jsonObject(productPresentation)}
            ) FILTER (WHERE ${productPresentation.productId} IS NOT NULL)
          `.as("presentations"),
        })
        .from(product)
        .leftJoin(
          productPresentation,
          eq(productPresentation.productId, product.id),
        )
        .where(
          and(
            eq(product.organizationId, organizationId),
            filter.id ? eq(product.id, filter.id) : undefined,
            filter.ids ? inArray(product.id, filter.ids) : undefined,
          ),
        )
        .groupBy(product.id),
    );

    if (errFind) return err(errFind);

    return ok(
      rows.map((row) => {
        const presentations = (
          JSON.parse(row.presentations) as ProductPresentationSelect[]
        ).map((presentation) => ({
          ...presentation,
          createdAt: new Date(presentation.createdAt),
          updatedAt: new Date(presentation.updatedAt),
        }));

        return Product.reconstitute({ ...row, presentations });
      }),
    );
  }

  public async findById(organizationId: string, productId: string) {
    const [products, errFind] = await this.find(organizationId, {
      id: productId,
    });

    if (errFind) return err(errFind);

    return ok(products.at(0) ?? null);
  }

  public async findManyByIds(organizationId: string, productIds: string[]) {
    return this.find(organizationId, { ids: productIds });
  }

  public async save(productEntity: Product, options?: Options) {
    const db = options?.tx ?? this.db;

    const { presentations: _presentations, ...rest } = productEntity.values;

    const [, errInsert] = await tryCatch(
      db
        .insert(product)
        .values(rest)
        .onConflictDoUpdate({
          target: product.id,
          set: {
            name: rest.name,
            searchBlob: rest.searchBlob,
            slug: rest.slug,
            description: rest.description,
            stock: rest.stock,
            minStock: rest.minStock,
            allowNegativeStock: rest.allowNegativeStock,
            status: rest.status,
            updatedAt: rest.updatedAt,
            categoryId: rest.categoryId,
          },
        }),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async saveOnlyProduct(
    productEntity: Product | Product[],
    options?: Options,
  ) {
    const products = Array.isArray(productEntity)
      ? productEntity
      : [productEntity];

    const db = options?.tx ?? this.db;

    const [, errInsert] = await tryCatch(
      db
        .insert(product)
        .values(products.map((p) => p.values))
        .onConflictDoUpdate({
          target: product.id,
          set: buildConflictUpdateColumn(product, [
            "name",
            "searchBlob",
            "slug",
            "description",
            "stock",
            "minStock",
            "allowNegativeStock",
            "status",
            "updatedAt",
            "categoryId",
          ]),
        }),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }
}
