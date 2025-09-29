import { and, eq, isNull } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { products, type InsertProduct } from '@repo/db';
import { ProductSummary } from '@repo/core/entities/product';
import { DeleteProductDto } from './dtos/delete-product.dto';

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
          eq(products.isActive, false),
        ),
      );
  }
}
