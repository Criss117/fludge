import { Member } from "@core/iam/domain/entities/member.entity";
import type {
  MemberRepository,
  Options,
} from "@core/iam/domain/repositories/member.repository";
import type { DatabaseService } from "@fludge/db";
import { member } from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, inArray } from "drizzle-orm";

export class SQLiteMemberRepository implements MemberRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findById(memberId: string) {
    const [rows, errFind] = await tryCatch(
      this.db.select().from(member).where(eq(member.id, memberId)),
    );

    if (errFind) return err(errFind);

    const memberRecord = rows.at(0);

    if (!memberRecord) return ok(null);

    return ok(Member.reconstitute(memberRecord));
  }

  public async findByIds(memberIds: string[], organizationId: string) {
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

  public async findByUserId(userId: string, organizationId: string) {
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

  public async insert(memberEntity: Member, options?: Options) {
    const db = options?.tx ?? this.db;

    const [, errInsert] = await tryCatch(
      db.insert(member).values(memberEntity.values).onConflictDoNothing(),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async update(memberEntity: Member) {
    const values = memberEntity.values;

    const [, errUpdate] = await tryCatch(
      this.db
        .update(member)
        .set(values)
        .where(
          and(
            eq(member.id, values.id),
            eq(member.organizationId, values.organizationId),
          ),
        ),
    );

    if (errUpdate) return err(errUpdate);

    return ok(undefined);
  }
}