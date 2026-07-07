import { eq, isNull, isNotNull, and, ne } from "drizzle-orm";

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

    // Pre-check: if a soft-deleted row with the same (orgId, slug) exists,
    // hard-delete it before upserting. Without this, onConflictDoUpdate would
    // resurrect the soft-deleted row instead of creating a new one.
    const [staleRows, staleError] = await tryCatch(
      db
        .select({ id: category.id })
        .from(category)
        .where(
          and(
            eq(category.organizationId, values.organizationId),
            eq(category.slug, values.slug),
            isNotNull(category.deletedAt),
          ),
        )
        .limit(1)
        .execute(),
    );

    if (staleError) return err(staleError);

    const staleRow = staleRows.at(0);

    if (staleRow) {
      const [, deleteError] = await tryCatch(
        db.delete(category).where(eq(category.id, staleRow.id)).execute(),
      );

      if (deleteError) return err(deleteError);
    }

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

  public async update(
    id: string,
    organizationId: string,
    values: Pick<CategoryInsert, "name" | "slug" | "parentId"> & {
      // null  => activate  (clears deleted_at)
      // Date  => deactivate (sets deleted_at)
      // omitted => leave status untouched (regular edit)
      deletedAt?: Date | null;
    },
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [data, error] = await tryCatch(
      db
        .update(category)
        .set({
          name: values.name,
          slug: values.slug,
          parentId: values.parentId,
          // Only touch deleted_at when the caller expressed an intent:
          // null = activate, Date = deactivate, undefined = leave as-is.
          ...(values.deletedAt !== undefined && {
            deletedAt: values.deletedAt,
          }),
        })
        .where(
          and(
            eq(category.id, id),
            eq(category.organizationId, organizationId),
          ),
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

  // Like findOne but excludes soft-deleted rows (deletedAt IS NOT NULL).
  // Used for parent validation where the parent must be active.
  public async findActiveOne(
    id: string,
    organizationId: string,
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [rows, error] = await tryCatch(
      db
        .select()
        .from(category)
        .where(
          and(
            eq(category.id, id),
            eq(category.organizationId, organizationId),
            isNull(category.deletedAt),
          ),
        )
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const c = rows.at(0);

    if (!c) return ok(null);

    return ok(c);
  }

  // Walks the parent chain from newParentId looking for categoryId.
  // If categoryId is found in the chain, moving the category under
  // newParentId would create a cycle. Capped at 3 hops — the hierarchy
  // is at most 2 levels deep, so 3 traversals are always sufficient.
  public async wouldCreateCycle(
    categoryId: string,
    newParentId: string,
    organizationId: string,
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    let currentId = newParentId;

    for (let i = 0; i < 3; i++) {
      if (currentId === categoryId) return ok(true);

      const [rows, error] = await tryCatch(
        db
          .select({ parentId: category.parentId })
          .from(category)
          .where(
            and(
              eq(category.id, currentId),
              eq(category.organizationId, organizationId),
            ),
          )
          .limit(1)
          .execute(),
      );

      if (error) return err(error);

      const c = rows.at(0);

      if (!c || !c.parentId) return ok(false);

      currentId = c.parentId;
    }

    return ok(false);
  }

  // Returns the count of active (non-soft-deleted) child subcategories.
  // count > 0 means the category has active children and cannot be hard-deleted.
  public async hasActiveChildren(
    id: string,
    organizationId: string,
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [rows, error] = await tryCatch(
      db
        .select({ id: category.id })
        .from(category)
        .where(
          and(
            eq(category.parentId, id),
            eq(category.organizationId, organizationId),
            isNull(category.deletedAt),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(rows.length);
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
    parentId: string | null,
    organizationId: string,
    excludeId?: string,
  ) {
    const conditions = [
      eq(category.organizationId, organizationId),
      eq(category.name, name),
      isNull(category.deletedAt),
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

  }