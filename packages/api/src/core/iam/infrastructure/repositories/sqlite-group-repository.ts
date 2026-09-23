import { Group } from "../../../iam/domain/entities/group.entity";
import type {
  GroupRepository,
  Options,
} from "../../../iam/domain/repositories/group.repository";
import { TransactionalRepository } from "../../../shared/repositories/transactional-repository";
import type { DatabaseService } from "@fludge/db";
import {
  group,
  groupMember,
  type GroupMemberSelect,
} from "@fludge/db/schema/iam.schema";
import { jsonObject } from "@fludge/db/utils/build-queries";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, getColumns, inArray, sql } from "drizzle-orm";

export class SQLiteGroupRepository
  extends TransactionalRepository
  implements GroupRepository
{
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  public async findById(groupId: string) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          ...getColumns(group),
          members: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(groupMember)}
            ) FILTER (WHERE ${groupMember.groupId} IS NOT NULL)
          `.as("members"),
        })
        .from(group)
        .leftJoin(groupMember, eq(group.id, groupMember.groupId))
        .where(eq(group.id, groupId)),
    );

    if (errFind) return err(errFind);

    const groupRecord = rows.at(0);

    if (!groupRecord) return ok(null);

    return ok(
      Group.reconstitute({
        ...groupRecord,
        members: (JSON.parse(groupRecord.members) as GroupMemberSelect[]).map(
          (member) => ({
            ...member,
            createdAt: new Date(member.createdAt),
          }),
        ),
      }),
    );
  }

  public async findByIds(groupIds: string[], organizationId: string) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select({ ...getColumns(group) })
        .from(group)
        .where(
          and(
            eq(group.organizationId, organizationId),
            inArray(group.id, groupIds),
          ),
        ),
    );

    if (errFind) return err(errFind);

    return ok(
      rows.map((groupRecord) =>
        Group.reconstitute({
          ...groupRecord,
          members: [],
        }),
      ),
    );
  }

  public async insert(groupEntity: Group, options?: Options) {
    const db = options?.tx ?? this.db;

    const [, errInsert] = await tryCatch(
      db.insert(group).values(groupEntity.values).onConflictDoNothing(),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async update(groupEntity: Group) {
    // Only the group table is updated. members is NOT persisted here:
    // groupMember is managed by its own repository.
    const { members: _members, ...rest } = groupEntity.values;

    const [, errUpdate] = await tryCatch(
      this.db
        .update(group)
        .set(rest)
        .where(
          and(
            eq(group.id, rest.id),
            eq(group.organizationId, rest.organizationId),
          ),
        ),
    );

    if (errUpdate) return err(errUpdate);

    return ok(undefined);
  }

  public async delete(
    organizationId: string,
    groupIds: string[],
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    const [, errDelete] = await tryCatch(
      db
        .delete(group)
        .where(
          and(
            eq(group.organizationId, organizationId),
            inArray(group.id, groupIds),
          ),
        ),
    );

    if (errDelete) return err(errDelete);

    return ok(undefined);
  }
}
