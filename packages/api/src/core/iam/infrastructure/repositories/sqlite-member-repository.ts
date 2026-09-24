import { Member } from "@fludge/api/core/iam/domain/entities/member.entity";
import type {
  MemberRepository,
  Options,
} from "@fludge/api/core/iam/domain/repositories/member.repository";
import type { DatabaseService } from "@fludge/db";
import { member } from "@fludge/db/schema/iam.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, inArray } from "drizzle-orm";

export class SQLiteMemberRepository implements MemberRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findById(organizationId: string, memberId: string) {
    const [rows, errFind] = await tryCatch(
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

    if (errFind) return err(errFind);

    const memberRecord = rows.at(0);

    if (!memberRecord) return ok(null);

    return ok(Member.reconstitute(memberRecord));
  }

  public async findByIds(organizationId: string, memberIds: string[]) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select()
        .from(member)
        .where(
          and(
            eq(member.organizationId, organizationId),
            inArray(member.id, memberIds),
          ),
        ),
    );

    if (errFind) return err(errFind);

    return ok(rows.map((memberRecord) => Member.reconstitute(memberRecord)));
  }

  public async findByUserId(organizationId: string, userId: string) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, userId),
            eq(member.organizationId, organizationId),
          ),
        ),
    );

    if (errFind) return err(errFind);

    const memberRecord = rows.at(0);

    if (!memberRecord) return ok(null);

    return ok(Member.reconstitute(memberRecord));
  }

  public async save(memberEntity: Member | Member[], options?: Options) {
    const members = Array.isArray(memberEntity) ? memberEntity : [memberEntity];

    const db = options?.tx ?? this.db;

    const [, errInsert] = await tryCatch(
      db
        .insert(member)
        .values(members.map((m) => m.values))
        .onConflictDoUpdate({
          target: member.id,
          set: buildConflictUpdateColumn(member, ["status", "updatedAt"]),
        }),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }
}
