import { GroupMember } from "@core/iam/domain/entities/group-member.entity";
import type {
  GroupMemberRepository,
  Options,
} from "@core/iam/domain/repositories/group-member.repository";
import type { DatabaseService } from "@fludge/db";
import { groupMember } from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq } from "drizzle-orm";

export class SQLiteGroupMemberRepository implements GroupMemberRepository {
  constructor(private readonly db: DatabaseService) {}

  public async insert(groupMemberEntity: GroupMember, options?: Options) {
    const db = options?.tx ?? this.db;

    const [, errInsert] = await tryCatch(
      db
        .insert(groupMember)
        .values(groupMemberEntity.values)
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
}