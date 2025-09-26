import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { products, type InsertProduct } from '@repo/db';
import { ProductSummary } from '@repo/core/entities/product';

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
}
