import {
  buildConflictUpdateColumn,
  type DatabaseService,
  type TransactionService,
} from "@fludge/db";
import { err, ok, tryCatch, type Result } from "@fludge/utils/trycatch";
import { member } from "@fludge/db/schema/iam.schema";
import type { Member } from "../../domain/entities/member.entity";

type Options = { tx?: TransactionService };

export class PgMemberRepository {
  constructor(private readonly db: DatabaseService) {}

  public async save(
    organizationId: string,
    membersValues: Member | Member[],
    options?: Options,
  ): Promise<Result<undefined, Error>> {
    const db = options?.tx ?? this.db;

    const members = Array.isArray(membersValues)
      ? membersValues
      : [membersValues];

    const [, errInsert] = await tryCatch(
      db
        .insert(member)
        .values(members.map((m) => ({ organizationId, ...m.values })))
        .onConflictDoUpdate({
          target: member.id,
          set: buildConflictUpdateColumn(member, [
            "userId",
            "assignedBy",
            "role",
          ]),
        }),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }
}
