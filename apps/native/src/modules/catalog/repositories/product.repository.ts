import { DatabaseService } from "@/integrations/db";
import {
  FindAllProductsFilters,
  ProductRepository,
  ProductSummary,
} from "@fludge/client/application/catalog/domain/product.repository";
import { product } from "@fludge/db/local-schemas/catalog.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { LocalProduct } from "@fludge/sync/entities/catalog.entities";
import { and, desc, eq, inArray, like, or } from "drizzle-orm";
import {
  type Cursor,
  type PaginatedResponse,
  paginate,
} from "@fludge/utils/pagination";

export class SQLiteProductRepository implements ProductRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllProductsFilters
  ): Promise<PaginatedResponse<ProductSummary>> {
    const rows = await this.db
      .select()
      .from(product)
      .where(
        and(
          eq(product.organizationId, organizationId),
          filters?.searchQuery
            ? or(
                like(product.name, `%${filters.searchQuery}%`),
                like(product.searchBlob, `%${filters.searchQuery}%`)
              )
            : undefined
        )
      )
      .limit(cursor.limit + 1)
      .offset(cursor.limit * cursor.page)
      .orderBy(desc(product.createdAt));

    return paginate(rows, cursor);
  }

  public async findOneById(
    organizationId: string,
    productId: string
  ): Promise<ProductSummary | null> {
    const rows = await this.db
      .select()
      .from(product)
      .where(
        and(
          eq(product.organizationId, organizationId),
          eq(product.id, productId)
        )
      )
      .limit(1);

    return rows.at(0) || null;
  }

  public async save(
    productValues: LocalProduct | LocalProduct[]
  ): Promise<LocalProduct[]> {
    const prductsArray = Array.isArray(productValues)
      ? productValues
      : [productValues];

    return this.db
      .insert(product)
      .values(prductsArray)
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
          "presentations",
        ]),
      })
      .returning();
  }

  public async delete(
    organizationId: string,
    productId: string | string[]
  ): Promise<void> {
    const productIds = Array.isArray(productId) ? productId : [productId];

    await this.db
      .delete(product)
      .where(
        and(
          eq(product.organizationId, organizationId),
          inArray(product.id, productIds)
        )
      );
  }
}
