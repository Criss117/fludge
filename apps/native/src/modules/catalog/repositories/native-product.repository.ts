import { DatabaseService } from "@/integrations/db";
import type {
  FindAllProductsFilters,
  ProductRepository,
  ProductDetail,
} from "@fludge/client/application/catalog/domain/product.repository";
import {
  buildConflictUpdateColumn,
  jsonObject,
  sortBy,
} from "@fludge/db/utils/build-queries";
import {
  and,
  desc,
  eq,
  getColumns,
  inArray,
  like,
  or,
  sql,
  SQL,
} from "drizzle-orm";
import {
  type Cursor,
  type PaginatedResponse,
  paginate,
} from "@fludge/utils/pagination";
import {
  localProduct,
  localProductPresentation,
  LocalProductPresentationSelect,
  LocalProductSelect,
} from "@fludge/db/local-schemas/shared.schema";

export class NativeProductRepository implements ProductRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findAll(
    organizationId: string,
    cursor: Cursor,
    filters: FindAllProductsFilters
  ): Promise<PaginatedResponse<ProductDetail>> {
    const orderByFilters: SQL[] = [];

    if (filters.orderBy.stock !== "none") {
      orderByFilters.push(sortBy(localProduct.stock, filters.orderBy.stock));
    }

    orderByFilters.push(
      sortBy(localProduct.createdAt, filters.orderBy.createdAt)
    );

    const rows = await this.db
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
        eq(localProduct.id, localProductPresentation.productId)
      )
      .where(
        and(
          eq(localProduct.organizationId, organizationId),
          or(
            like(localProduct.name, `%${filters.searchQuery}%`),
            like(localProduct.searchBlob, `%${filters.searchQuery}%`)
          ),
          filters.status !== "all"
            ? eq(localProduct.status, filters.status)
            : undefined
        )
      )
      .limit(cursor.limit + 1)
      .offset(cursor.limit * cursor.page)
      .groupBy(localProduct.id)
      .orderBy(...orderByFilters);

    return paginate(
      rows.map((p) => {
        const presentations = (
          JSON.parse(p.presentations) as LocalProductPresentationSelect[]
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
      cursor
    );
  }

  public async findOneById(
    organizationId: string,
    productId: string
  ): Promise<ProductDetail | null> {
    const rows = await this.db
      .select()
      .from(localProduct)
      .where(
        and(
          eq(localProduct.organizationId, organizationId),
          eq(localProduct.id, productId)
        )
      )
      .limit(1);

    const product = rows.at(0);

    if (!product) return null;

    const presentations = await this.db
      .select()
      .from(localProductPresentation)
      .where(eq(localProductPresentation.productId, productId))
      .orderBy(desc(localProductPresentation.createdAt));

    return {
      ...product,
      presentations,
    };
  }

  public async save(productValues: ProductDetail | ProductDetail[]) {
    const productsArray = Array.isArray(productValues)
      ? productValues
      : [productValues];

    const productsValues: LocalProductSelect[] = [];
    const presentationsValues: LocalProductPresentationSelect[] = [];

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
        tx.insert(localProductPresentation)
          .values(presentationsValues)
          .onConflictDoUpdate({
            target: localProductPresentation.id,
            set: buildConflictUpdateColumn(localProductPresentation, [
              "barcode",
              "conversionFactor",
              "name",
              "pricePurchase",
              "priceSale",
              "priceWholesale",
              "searchBlob",
              "status",
              "updatedAt",
            ]),
          })
          .run();
      }
    });
  }

  public async delete(
    organizationId: string,
    productId: string | string[]
  ): Promise<void> {
    const productIds = Array.isArray(productId) ? productId : [productId];

    await this.db.transaction((tx) => {
      tx.delete(localProductPresentation)
        .where(
          and(
            eq(localProductPresentation.organizationId, organizationId),
            inArray(localProductPresentation.productId, productIds)
          )
        )
        .run();

      tx.delete(localProduct)
        .where(
          and(
            eq(localProduct.organizationId, organizationId),
            inArray(localProduct.id, productIds)
          )
        )
        .run();
    });
  }
}
