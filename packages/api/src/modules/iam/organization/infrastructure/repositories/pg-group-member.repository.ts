import { type DatabaseService, type TransactionService } from "@fludge/db";
import { err, ok, tryCatch, type Result } from "@fludge/utils/trycatch";
import { groupMember } from "@fludge/db/schema/iam.schema";
import type { GroupMember } from "@fludge/api/modules/iam/organization/domain/entities/group-member.entity";

type Options = { tx?: TransactionService };

export class PgGroupMemberRepository {
  constructor(private readonly db: DatabaseService) {}

  public async save(
    organizationId: string,
    groupMembersValues: GroupMember | GroupMember[],
    options?: Options,
  ): Promise<Result<undefined, Error>> {
    const db = options?.tx ?? this.db;

    const groupMembers = Array.isArray(groupMembersValues)
      ? groupMembersValues
      : [groupMembersValues];

    const [, errInsert] = await tryCatch(
      db
        .insert(groupMember)
        .values(
          groupMembers.map((gm) => ({
            organizationId,
            ...gm.values,
          })),
        )
        .onConflictDoNothing(),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }
}
