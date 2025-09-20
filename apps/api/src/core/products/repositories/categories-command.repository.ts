import { DBSERVICE, TX, type LibSQLDatabase } from '@core/db/db.module';
import { Inject, Injectable } from '@nestjs/common';
import { categories, type InsertCategory } from '@repo/db';

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
}
