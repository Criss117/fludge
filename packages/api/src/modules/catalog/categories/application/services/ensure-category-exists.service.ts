import type { DatabaseService } from "@fludge/db";
import { category } from "@fludge/db/schema/catalog.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, inArray } from "drizzle-orm";

export class EnsureCategoryExistsService {
  constructor(private readonly db: DatabaseService) {}

  public async validate(
    organizationId: string,
    categoryIds: string | string[],
  ) {
    const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          id: category.id,
        })
        .from(category)
        .where(
          and(
            eq(category.organizationId, organizationId),
            inArray(category.id, ids),
          ),
        ),
    );

    if (errFind) return err(errFind);

    if (rows.length !== ids.length) return ok(false);

    return ok(true);
  }
}
