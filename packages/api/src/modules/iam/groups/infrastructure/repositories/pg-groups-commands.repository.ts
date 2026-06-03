import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DbConnection } from "@fludge/db";
import {
  group,
  groupHistory,
  type GroupHistoryInsert,
  type GroupInsert,
} from "@fludge/db/schemas/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq } from "drizzle-orm";

export class PGGroupsCommandsRepository extends TransactionalRepository {
  constructor(private readonly db: DbConnection) {
    super(db);
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

  public async slugAvailable(slug: string, organizationId: string) {
    const [exists, error] = await tryCatch(
      this.db
        .select({
          id: group.id,
        })
        .from(group)
        .where(
          and(eq(group.organizationId, organizationId), eq(group.slug, slug)),
        )
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const g = exists.at(0);

    if (!g) return ok(true);

    return ok(false);
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

  public async saveHistory(
    values: GroupHistoryInsert,
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [data, error] = await tryCatch(
      db
        .insert(groupHistory)
        .values(values)
        .onConflictDoUpdate({
          target: groupHistory.id,
          set: {
            action: values.action,
            description: values.description,
            before: values.before,
            after: values.after,
            by: values.by,
          },
        })
        .returning({
          id: groupHistory.id,
        })
        .execute(),
    );

    if (error) return err(error);

    const created = data.at(0);

    if (!created) return err(new Error("Error creando historial de grupo"));

    return ok(created);
  }
}
