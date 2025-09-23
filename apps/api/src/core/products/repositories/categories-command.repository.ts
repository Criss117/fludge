import { DBSERVICE, TX, type LibSQLDatabase } from '@core/db/db.module';
import { Inject, Injectable } from '@nestjs/common';
import { categories, type InsertCategory } from '@repo/db';
import { and, eq, inArray } from 'drizzle-orm';
import { DeleteCategoryDto } from './dtos/delete-category.dto';

type Options = {
  tx?: TX;
};

@Injectable()
export class CategoriesCommandRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async save(data: InsertCategory, options?: Options) {
    const db = options?.tx || this.db;

    await db
      .insert(categories)
      .values(data)
      .onConflictDoUpdate({
        target: categories.id,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      });
  }

  public async saveAndGet(data: InsertCategory, options?: Options) {
    const db = options?.tx || this.db;

    const result = await db
      .insert(categories)
      .values(data)
      .onConflictDoUpdate({
        target: categories.id,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result;
  }

  public async delete(data: DeleteCategoryDto, options?: Options) {
    const db = options?.tx || this.db;

    await db
      .update(categories)
      .set({
        deletedAt: new Date(),
        isActive: false,
      })
      .where(
        and(
          eq(categories.id, data.categoryId),
          eq(categories.businessId, data.businessId),
        ),
      );
  }

  public async deleteMany(data: DeleteCategoryDto[], options?: Options) {
    const db = options?.tx || this.db;

    await db
      .update(categories)
      .set({
        deletedAt: new Date(),
        isActive: false,
      })
      .where(
        and(
          inArray(
            categories.id,
            data.map((item) => item.categoryId),
          ),
          inArray(
            categories.businessId,
            data.map((item) => item.businessId),
          ),
        ),
      );
  }
}
