import { and, eq, ne, or, type SQL } from "drizzle-orm";

import type { DBConnection } from "@fludge/db";
import { group } from "@fludge/db/schemas/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

export class GroupsChecksService {
  constructor(private readonly db: DBConnection) {}

  public async checkUniqueFields(
    values: {
      slug?: string;
      name?: string;
    },
    organizationId: string,
    excludeId?: string,
  ) {
    const { slug, name } = values;

    const orConditions = [
      slug ? eq(group.slug, slug) : undefined,
      name ? eq(group.name, name) : undefined,
    ].filter(Boolean) as SQL[];

    // Si no hay ningún valor para comparar, no hay nada que consultar
    if (orConditions.length === 0) {
      return ok({
        slugTaken: false,
        nameTaken: false,
      });
    }

    const conditions = [
      eq(group.organizationId, organizationId),
      or(...orConditions),
    ];

    if (excludeId) {
      conditions.push(ne(group.id, excludeId));
    }

    const [rows, error] = await tryCatch(
      this.db
        .select({
          slug: group.slug,
          name: group.name,
        })
        .from(group)
        .where(and(...conditions))
        .execute(),
    );

    if (error) return err(error);

    const slugTaken = slug ? rows.some((r) => r.slug === slug) : false;
    const nameTaken = name ? rows.some((r) => r.name === name) : false;

    return ok({
      slugTaken,
      nameTaken,
    });
  }
}
