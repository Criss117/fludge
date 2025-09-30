import { and, eq, inArray, isNull } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, type TX, type LibSQLDatabase } from '@core/db/db.module';
import { products, type InsertProduct } from '@repo/db';
import { ProductSummary } from '@repo/core/entities/product';
import { DeleteProductDto } from './dtos/delete-product.dto';
import { UnlinkCategoriesFromProductsDto } from './dtos/unlink-categories-from-products.dto';

type Options = {
  ensureActive?: boolean;
  tx?: TX;
};

@Injectable()
export class ProductsCommnadsRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async save(data: InsertProduct) {
    const [createdProduct] = await this.db
      .insert(products)
      .values(data)
      .onConflictDoUpdate({
        target: products.id,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: products.id,
      });

    return createdProduct;
  }

  public async saveAndGet(data: InsertProduct): Promise<ProductSummary> {
    const [createdProduct] = await this.db
      .insert(products)
      .values(data)
      .onConflictDoUpdate({
        target: products.id,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning();

    return createdProduct;
  }

  public async delete(meta: DeleteProductDto) {
    await this.db
      .update(products)
      .set({
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, meta.productId),
          eq(products.businessId, meta.businessId),
          isNull(products.deletedAt),
          eq(products.isActive, true),
        ),
      );
  }

  public async unlinkCategories(
    meta: UnlinkCategoriesFromProductsDto,
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    await db
      .update(products)
      .set({
        categoryId: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.isActive, true),
          eq(products.businessId, meta.businessId),
          inArray(products.categoryId, meta.categoriesIds),
        ),
      );
  }
}
