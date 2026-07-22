import { and, eq, inArray } from "drizzle-orm";

import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DBConnection } from "@fludge/db";
import { group, type GroupInsert } from "@fludge/db/schemas/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

export class PGGroupRepository extends TransactionalRepository {
  constructor(private readonly db: DBConnection) {
    super(db);
  }

  public async save(values: GroupInsert, options?: TransactionalOptions) {
    const db = options?.tx ?? this.db;

    const [data, error] = await tryCatch(
      db
        .insert(group)
        .values(values)
        .onConflictDoUpdate({
          target: group.id,
          set: {
            name: values.name,
            slug: values.slug,
            permissions: values.permissions,
            description: values.description,
            deletedAt: values.deletedAt,
          },
        })
        .returning()
        .execute(),
    );

    if (error) return err(error);

    const created = data.at(0);

    if (!created) return err(new Error("Error creando grupo"));

    return ok(created);
  }

  public async findOne(organizationId: string, groupId: string) {
    const [exists, error] = await tryCatch(
      this.db
        .select()
        .from(group)
        .where(
          and(eq(group.organizationId, organizationId), eq(group.id, groupId)),
        )
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const g = exists.at(0);

    if (!g) return ok(null);

    return ok(g);
  }

  public async hardDelete(
    organizationId: string,
    groupIds: string | string[],
    options?: TransactionalOptions,
  ) {
    if (!Array.isArray(groupIds)) groupIds = [groupIds];

    if (groupIds.length === 0)
      return err(new Error("No se especificó ningún id de grupo"));

    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .delete(group)
        .where(
          and(
            eq(group.organizationId, organizationId),
            inArray(group.id, groupIds),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }
}
