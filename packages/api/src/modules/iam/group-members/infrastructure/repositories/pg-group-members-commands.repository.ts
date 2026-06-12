import { and, inArray } from "drizzle-orm";
import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DbConnection } from "@fludge/db";
import { groupMember } from "@fludge/db/schemas/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

type GroupMembersDelete = {
  groupIds: string[];
  memberIds: string[];
};

type GroupMembersInsert = {
  groupId: string;
  memberId: string;
  assignedBy: string | null;
};

export class PgGroupMembersCommandsRepository extends TransactionalRepository {
  constructor(private readonly db: DbConnection) {
    super(db);
  }

  public async assignMembers(
    values: GroupMembersInsert[],
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [createdData, error] = await tryCatch(
      db
        .insert(groupMember)
        .values(values)
        .onConflictDoNothing()
        .returning()
        .execute(),
    );

    if (error) return err(error);

    return ok(createdData);
  }

  public async unassignMembers(
    values: GroupMembersDelete,
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .delete(groupMember)
        .where(
          and(
            inArray(groupMember.groupId, values.groupIds),
            inArray(groupMember.memberId, values.memberIds),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }
}
