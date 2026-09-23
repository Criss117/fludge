import { Category } from "../../../../catalog/categories/domain/entities/category.entity";
import type {
  CategoryRepository,
  Options,
} from "../../../../catalog/categories/domain/repositories/category.repository";
import type { DatabaseService } from "@fludge/db";
import { category } from "@fludge/db/schema/catalog.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq } from "drizzle-orm";

export class SQLiteCategoryRepository implements CategoryRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findById(organizationId: string, categoryId: string) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select()
        .from(category)
        .where(
          and(
            eq(category.organizationId, organizationId),
            eq(category.id, categoryId),
          ),
        ),
    );

    if (errFind) return err(errFind);

    const cat = rows.at(0);

    if (!cat) return ok(null);

    return ok(Category.reconstitute(cat));
  }

  public async insert(categoryEntity: Category, options?: Options) {
    const db = options?.tx ?? this.db;

    const [, errInsert] = await tryCatch(
      db.insert(category).values(categoryEntity.values).onConflictDoNothing(),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async update(categoryEntity: Category, options?: Options) {
    const db = options?.tx ?? this.db;

    const [, errUpdate] = await tryCatch(
      db
        .update(category)
        .set(categoryEntity.values)
        .where(
          and(
            eq(category.id, categoryEntity.values.id),
            eq(category.organizationId, categoryEntity.values.organizationId),
          ),
        ),
    );

    if (errUpdate) return err(errUpdate);

    return ok(undefined);
  }
}