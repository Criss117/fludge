import { Category } from "@fludge/api/core/catalog/categories/domain/entities/category.entity";
import type {
  CategoryRepository,
  Options,
} from "@fludge/api/core/catalog/categories/domain/repositories/category.repository";
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

  public async save(categoryEntity: Category, options?: Options) {
    const db = options?.tx ?? this.db;
    const values = categoryEntity.values;

    const [, errInsert] = await tryCatch(
      db
        .insert(category)
        .values(values)
        .onConflictDoUpdate({
          target: category.id,
          set: {
            description: values.description,
            name: values.name,
            status: values.status,
            updatedAt: values.updatedAt,
            slug: values.slug,
          },
        }),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }
}
