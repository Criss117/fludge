import { count, eq, isNull, and, ne } from "drizzle-orm";

import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DbConnection } from "@fludge/db";
import {
  category,
  type CategoryInsert,
} from "@fludge/db/schemas/catalog.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

export class PGCategoriesCommandsRepository extends TransactionalRepository {
  constructor(private readonly db: DbConnection) {
    super(db);
  }

  public async save(values: CategoryInsert, options?: TransactionalOptions) {
    const db = options?.tx ?? this.db;

    const [data, error] = await tryCatch(
      db
        .insert(category)
        .values(values)
        .onConflictDoUpdate({
          target: [category.organizationId, category.slug],
          set: {
            name: values.name,
            slug: values.slug,
            parentId: values.parentId,
            createdBy: values.createdBy,
          },
        })
        .returning()
        .execute(),
    );

    if (error) return err(error);

    const created = data.at(0);

    if (!created) return err(new Error("Error creando categoría"));

    return ok(created);
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
    parentId: string | null,
    organizationId: string,
    excludeId?: string,
  ) {
    const conditions = [
      eq(category.organizationId, organizationId),
      eq(category.name, name),
    ];

    if (parentId === null) {
      conditions.push(isNull(category.parentId));
    } else {
      conditions.push(eq(category.parentId, parentId));
    }

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

  public async parentDepth(id: string) {
    let depth = 0;
    let currentId = id;

    for (let i = 0; i < 3; i++) {
      const [rows, error] = await tryCatch(
        this.db
          .select({ parentId: category.parentId })
          .from(category)
          .where(eq(category.id, currentId))
          .limit(1)
          .execute(),
      );

      if (error) return err(error);

      const c = rows.at(0);

      if (!c || !c.parentId) return ok(depth);

      depth++;
      currentId = c.parentId;
    }

    return ok(depth);
  }

  public async hardDelete(
    id: string,
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
            eq(category.id, id),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }

  public async activate(
    id: string,
    organizationId: string,
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .update(category)
        .set({
          deletedAt: null,
        })
        .where(
          and(
            eq(category.organizationId, organizationId),
            eq(category.id, id),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }

  public async deactivate(
    id: string,
    organizationId: string,
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .update(category)
        .set({
          deletedAt: new Date(),
        })
        .where(
          and(
            eq(category.organizationId, organizationId),
            eq(category.id, id),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }
}