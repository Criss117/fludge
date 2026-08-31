import type { DatabaseService } from "@fludge/db";
import { category } from "@fludge/db/schema/catalog.schema";
import { and, eq, ne, or, SQL } from "drizzle-orm";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

type Values = {
  slug?: string;
  name?: string;
};

export class CategoryUniquenessValidator {
  constructor(private readonly db: DatabaseService) {}

  public async validateUniqueFields(value: Values, excludeId?: string) {
    const { name, slug } = value;

    const orConditions = [
      name && eq(category.name, name),
      slug && eq(category.slug, slug),
    ].filter(Boolean) as SQL[];

    if (orConditions.length === 0)
      return ok({
        nameTaken: false,
        slugTaken: false,
      });

    const conditions = [or(...orConditions)];

    if (excludeId) conditions.push(ne(category.id, excludeId));

    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          name: category.name,
          slug: category.slug,
        })
        .from(category)
        .where(and(...conditions)),
    );

    if (errFind) return err(errFind);

    const nameTaken = rows.some((r) => r.name === name);
    const slugTaken = rows.some((r) => r.slug === slug);

    return ok({
      nameTaken,
      slugTaken,
    });
  }
}
