import { and, count, eq, inArray } from "drizzle-orm";

import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DbConnection } from "@fludge/db";
import {
  group,
  groupHistory,
  groupMember,
  type GroupHistoryInsert,
  type GroupInsert,
} from "@fludge/db/schemas/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

export class PGGroupsCommandsRepository extends TransactionalRepository {
  constructor(private readonly db: DbConnection) {
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

  public async exisits(organizationId: string, groupId: string | string[]) {
    if (!Array.isArray(groupId)) groupId = [groupId];

    if (groupId.length === 0)
      return err(new Error("No se especificó ningún id de grupo"));

    const [exists, error] = await tryCatch(
      this.db
        .select({
          total: count(group.id),
        })
        .from(group)
        .where(
          and(
            eq(group.organizationId, organizationId),
            inArray(group.id, groupId),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    const g = exists.at(0);

    if (!g) return ok(false);

    if (g.total !== groupId.length) return ok(false);

    return ok(true);
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

  public async deactivate(
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
        .update(group)
        .set({
          deletedAt: new Date(),
        })
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

  public async activate(
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
        .update(group)
        .set({
          deletedAt: null,
        })
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

  public async assignMembers(
    groupId: string,
    memberIds: string | string[],
    assignedBy: string | null,
    options?: TransactionalOptions,
  ) {
    if (!Array.isArray(memberIds)) memberIds = [memberIds];

    if (memberIds.length === 0)
      return err(new Error("No se especificó ningún id de miembro"));

    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .insert(groupMember)
        .values(
          memberIds.map((memberId) => ({
            groupId,
            memberId,
            assignedBy,
          })),
        )
        .onConflictDoNothing()
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }

  public async unassignMembers(
    groupId: string,
    memberIds: string | string[],
    options?: TransactionalOptions,
  ) {
    if (!Array.isArray(memberIds)) memberIds = [memberIds];

    if (memberIds.length === 0)
      return err(new Error("No se especificó ningún id de miembro"));

    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .delete(groupMember)
        .where(
          and(
            eq(groupMember.groupId, groupId),
            inArray(groupMember.memberId, memberIds),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }
}
