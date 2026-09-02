import type { DatabaseService } from "@fludge/db";
import { Category } from "@fludge/api/modules/catalog/categories/domain/entities/category.entity";
import { err, ok, tryCatch, type Result } from "@fludge/utils/trycatch";
import { category } from "@fludge/db/schema/catalog.schema";
import { and, eq } from "drizzle-orm";

export class CategoryRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findOneById(
    organizationId: string,
    categoryId: string,
  ): Promise<Result<Category | null>> {
    const [data, errSelect] = await tryCatch(
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

    if (errSelect) return err(errSelect);

    const cat = data.at(0);

    if (!cat) return ok(null);

    return ok(Category.reconstitute(cat));
  }

  public async save(categoryEntitie: Category) {
    const values = categoryEntitie.values;

    return tryCatch(
      this.db.insert(category).values(values).onConflictDoUpdate({
        target: category.id,
        set: values,
      }),
    );
  }

  public async delete(organizationId: string, categoryId: string) {
    return tryCatch(
      this.db
        .delete(category)
        .where(
          and(
            eq(category.organizationId, organizationId),
            eq(category.id, categoryId),
          ),
        ),
    );
  }
}
