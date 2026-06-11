import { and, inArray } from "drizzle-orm";
import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DbConnection } from "@fludge/db";
import { groupMember } from "@fludge/db/schemas/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

type UnassignMembersParams =
  | {
      groupId: string;
      memberIds: string[];
    }
  | {
      groupIds: string[];
      memberId: string;
    };

type AssignMembersParams =
  | {
      groupId: string;
      memberIds: string[];
      assignedBy: string | null;
    }
  | {
      groupIds: string[];
      memberId: string;
      assignedBy: string | null;
    };

export class PgGroupMembersCommandsRepository extends TransactionalRepository {
  constructor(private readonly db: DbConnection) {
    super(db);
  }

  public async assignMembers(
    values: AssignMembersParams,
    options?: TransactionalOptions,
  ) {
    let data: {
      groupId: string;
      memberId: string;
      assignedBy: string | null;
    }[] = [];

    if ("groupId" in values) {
      data = values.memberIds.map((memberId) => ({
        groupId: values.groupId,
        memberId,
        assignedBy: values.assignedBy,
      }));
    } else {
      data = values.groupIds.map((groupId) => ({
        groupId,
        memberId: values.memberId,
        assignedBy: values.assignedBy,
      }));
    }

    const db = options?.tx ?? this.db;

    const [createdData, error] = await tryCatch(
      db
        .insert(groupMember)
        .values(data)
        .onConflictDoNothing()
        .returning()
        .execute(),
    );

    if (error) return err(error);

    return ok(createdData);
  }

  public async unassignMembers(
    values: UnassignMembersParams,
    options?: TransactionalOptions,
  ) {
    const groupIds = "groupId" in values ? [values.groupId] : values.groupIds;
    const memberIds =
      "memberId" in values ? [values.memberId] : values.memberIds;

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
