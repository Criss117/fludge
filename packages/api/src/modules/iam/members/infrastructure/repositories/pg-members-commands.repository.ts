import { and, eq, inArray } from "drizzle-orm";

import type { DbConnection } from "@fludge/db";
import { member } from "@fludge/db/schemas/auth.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { groupMember } from "@fludge/db/schemas/iam.schema";
import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";

export class PGMembersCommandsRepository extends TransactionalRepository {
  constructor(private readonly db: DbConnection) {
    super(db);
  }

  public async findOne(organizationId: string, memberId: string) {
    const [exists, error] = await tryCatch(
      this.db
        .select()
        .from(member)
        .where(
          and(
            eq(member.organizationId, organizationId),
            eq(member.id, memberId),
          ),
        ),
    );

    if (error) return err(error);

    const m = exists.at(0);

    if (!m) return ok(null);

    return ok(m);
  }

  public async assigGroups(
    memberId: string,
    groupIds: string | string[],
    assignedBy: string | null,
    options?: TransactionalOptions,
  ) {
    if (!Array.isArray(groupIds)) groupIds = [groupIds];

    if (groupIds.length === 0)
      return err(new Error("No se especificó ningún id de miembro"));

    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .insert(groupMember)
        .values(
          groupIds.map((groupId) => ({
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

  public async unassigGroups(
    memberId: string,
    groupIds: string | string[],
    options?: TransactionalOptions,
  ) {
    if (!Array.isArray(groupIds)) groupIds = [groupIds];

    if (groupIds.length === 0)
      return err(new Error("No se especificó ningún id de miembro"));

    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .delete(groupMember)
        .where(
          and(
            eq(groupMember.memberId, memberId),
            inArray(groupMember.groupId, groupIds),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }
}
