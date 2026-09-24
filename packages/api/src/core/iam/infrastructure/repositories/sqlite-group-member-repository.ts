import { GroupMember } from "@fludge/api/core/iam/domain/entities/group-member.entity";
import type {
  GroupMemberRepository,
  Options,
} from "@fludge/api/core/iam/domain/repositories/group-member.repository";
import type { DatabaseService } from "@fludge/db";
import { groupMember } from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, inArray } from "drizzle-orm";

export class SQLiteGroupMemberRepository implements GroupMemberRepository {
  constructor(private readonly db: DatabaseService) {}

  public async insert(
    groupMemberEntity: GroupMember | GroupMember[],
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    const groupMembers = Array.isArray(groupMemberEntity)
      ? groupMemberEntity
      : [groupMemberEntity];

    const [, errInsert] = await tryCatch(
      db
        .insert(groupMember)
        .values(groupMembers.map((gm) => gm.values))
        .onConflictDoNothing(),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async delete(groupMemberEntity: GroupMember, options?: Options) {
    const db = options?.tx ?? this.db;

    const values = groupMemberEntity.values;

    const [, errDelete] = await tryCatch(
      db
        .delete(groupMember)
        .where(
          and(
            eq(groupMember.organizationId, values.organizationId),
            eq(groupMember.groupId, values.groupId),
            eq(groupMember.memberId, values.memberId),
          ),
        ),
    );

    if (errDelete) return err(errDelete);

    return ok(undefined);
  }

  public async deleteByGroupIds(
    organizationId: string,
    groupIds: string[],
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    const [, errDelete] = await tryCatch(
      db
        .delete(groupMember)
        .where(
          and(
            eq(groupMember.organizationId, organizationId),
            inArray(groupMember.groupId, groupIds),
          ),
        ),
    );

    if (errDelete) return err(errDelete);

    return ok(undefined);
  }

  public async deleteByGroupAndMemberIds(
    organizationId: string,
    groupId: string,
    memberIds: string[],
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    const [, errDelete] = await tryCatch(
      db
        .delete(groupMember)
        .where(
          and(
            eq(groupMember.organizationId, organizationId),
            eq(groupMember.groupId, groupId),
            inArray(groupMember.memberId, memberIds),
          ),
        ),
    );

    if (errDelete) return err(errDelete);

    return ok(undefined);
  }

  public async deleteByMemberAndGroupIds(
    organizationId: string,
    memberId: string,
    groupIds: string[],
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    const [, errDelete] = await tryCatch(
      db
        .delete(groupMember)
        .where(
          and(
            eq(groupMember.organizationId, organizationId),
            eq(groupMember.memberId, memberId),
            inArray(groupMember.groupId, groupIds),
          ),
        ),
    );

    if (errDelete) return err(errDelete);

    return ok(undefined);
  }
}
