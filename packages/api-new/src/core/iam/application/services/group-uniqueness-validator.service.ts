import type { DatabaseService } from "@fludge/db";
import { group } from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, ne, or, SQL } from "drizzle-orm";

type Values = {
  slug?: string;
  name?: string;
};

export class GroupUniquenessValidator {
  constructor(private readonly db: DatabaseService) {}

  public async validateUniqueFields(
    organizationId: string,
    value: Values,
    excludeId?: string,
  ) {
    const { name, slug } = value;

    const orConditions = [
      name && eq(group.name, name),
      slug && eq(group.slug, slug),
    ].filter(Boolean) as SQL[];

    if (orConditions.length === 0)
      return ok({
        nameTaken: false,
        slugTaken: false,
      });

    const conditions = [
      eq(group.organizationId, organizationId),
      or(...orConditions),
    ];

    if (excludeId) {
      conditions.push(ne(group.id, excludeId));
    }

    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          name: group.name,
          slug: group.slug,
        })
        .from(group)
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