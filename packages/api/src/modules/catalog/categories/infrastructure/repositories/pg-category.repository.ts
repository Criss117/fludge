import { eq, isNull, and, ne, inArray } from "drizzle-orm";

import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DBConnection } from "@fludge/db";
import {
  category,
  type CategoryInsert,
} from "@fludge/db/schemas/catalog.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

export class PGCategoryRepository extends TransactionalRepository {
  constructor(private readonly db: DBConnection) {
    super(db);
  }

  public async save(values: CategoryInsert, options?: TransactionalOptions) {
    const db = options?.tx ?? this.db;

    const [data, error] = await tryCatch(
      db.insert(category).values(values).returning().execute(),
    );

    if (error) return err(error);

    const created = data.at(0)!;

    if (!created) return err(new Error("Error creando categoría"));

    return ok(created);
  }

  public async update(
    id: string,
    organizationId: string,
    values: Pick<CategoryInsert, "name" | "slug" | "deletedAt">,
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [data, error] = await tryCatch(
      db
        .update(category)
        .set({
          name: values.name,
          slug: values.slug,
          deletedAt: values.deletedAt,
        })
        .where(
          and(eq(category.id, id), eq(category.organizationId, organizationId)),
        )
        .returning()
        .execute(),
    );

    if (error) return err(error);

    const updated = data.at(0);

    if (!updated) return ok(null);

    return ok(updated);
  }

  public async findOne(id: string, organizationId: string) {
    const [rows, error] = await tryCatch(
      this.db
        .select()
        .from(category)
        .where(
          and(eq(category.id, id), eq(category.organizationId, organizationId)),
        )
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const c = rows.at(0);

    if (!c) return ok(null);

    return ok(c);
  }

  public async slugAvailable(
    slug: string,
    organizationId: string,
    excludeId?: string,
  ) {
    const conditions = [
      eq(category.organizationId, organizationId),
      eq(category.slug, slug),
      isNull(category.deletedAt),
    ];

    if (excludeId) {
      conditions.push(ne(category.id, excludeId));
    }

    const [rows, error] = await tryCatch(
      this.db
        .select({ id: category.id })
        .from(category)
        .where(and(...conditions))
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const c = rows.at(0);

    if (!c) return ok(true);

    return ok(false);
  }

  public async exists(
    name: string,
    organizationId: string,
    excludeId?: string,
  ) {
    const conditions = [
      eq(category.organizationId, organizationId),
      eq(category.name, name),
      isNull(category.deletedAt),
    ];
    if (excludeId) {
      conditions.push(ne(category.id, excludeId));
    }

    const [rows, error] = await tryCatch(
      this.db
        .select({ id: category.id })
        .from(category)
        .where(and(...conditions))
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const c = rows.at(0);

    if (!c) return ok(false);

    return ok(true);
  }

  public async hardDelete(
    ids: string[],
    organizationId: string,
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .delete(category)
        .where(
          and(
            eq(category.organizationId, organizationId),
            inArray(category.id, ids),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }
}
