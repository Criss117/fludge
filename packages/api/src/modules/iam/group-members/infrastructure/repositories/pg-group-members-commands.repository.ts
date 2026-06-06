import { and, inArray } from "drizzle-orm";
import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DbConnection } from "@fludge/db";
import { groupMember } from "@fludge/db/schemas/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

export class PgGroupMembersCommandsRepository extends TransactionalRepository {
  constructor(private readonly db: DbConnection) {
    super(db);
  }

  public async assignMembers(
    groupIds: string | string[],
    memberIds: string | string[],
    assignedBy: string | null,
    options?: TransactionalOptions,
  ) {
    if (!Array.isArray(memberIds)) memberIds = [memberIds];
    if (!Array.isArray(groupIds)) groupIds = [groupIds];

    if (memberIds.length === 0 || groupIds.length === 0)
      return err(new Error("No se especificó ningún id"));

    const db = options?.tx ?? this.db;

    const values = groupIds
      .map((groupId) => {
        return memberIds.map((memberId) => ({
          groupId,
          memberId,
          assignedBy,
        }));
      })
      .flat();

    const [, error] = await tryCatch(
      db.insert(groupMember).values(values).onConflictDoNothing().execute(),
    );

    if (error) return err(error);

    return ok(null);
  }

  public async unassignMembers(
    groupIds: string | string[],
    memberIds: string | string[],
    options?: TransactionalOptions,
  ) {
    if (!Array.isArray(memberIds)) memberIds = [memberIds];
    if (!Array.isArray(groupIds)) groupIds = [groupIds];

    if (memberIds.length === 0 || groupIds.length === 0)
      return err(new Error("No se especificó ningún id"));

    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .delete(groupMember)
        .where(
          and(
            inArray(groupMember.groupId, groupIds),
            inArray(groupMember.memberId, memberIds),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }
}
