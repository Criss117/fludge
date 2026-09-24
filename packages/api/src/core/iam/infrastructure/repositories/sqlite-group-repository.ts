import { Group } from "@fludge/api/core/iam/domain/entities/group.entity";
import type {
  GroupRepository,
  Options,
} from "@fludge/api/core/iam/domain/repositories/group.repository";
import { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";
import type { DatabaseService } from "@fludge/db";
import {
  group,
  groupMember,
  type GroupMemberSelect,
} from "@fludge/db/schema/iam.schema";
import {
  buildConflictUpdateColumn,
  jsonObject,
} from "@fludge/db/utils/build-queries";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, getColumns, inArray, sql } from "drizzle-orm";
import type { GroupMemberRepository } from "../../domain/repositories/group-member.repository";

export class SQLiteGroupRepository
  extends TransactionalRepository
  implements GroupRepository
{
  constructor(
    private readonly db: DatabaseService,
    private readonly groupMemberRepository: GroupMemberRepository,
  ) {
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

  public async findByIds(organizationId: string, groupIds: string[]) {
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

  public async delete(groupEntity: Group | Group[]) {
    const groups = Array.isArray(groupEntity) ? groupEntity : [groupEntity];

    const organizationId = groups[0]!.values.organizationId;
    const groupIdsToDelete = groups.map((g) => g.id.toString());

    const [, errDelete] = await tryCatch(
      this.db.transaction(async (tx) => {
        await this.groupMemberRepository.deleteByGroupIds(
          organizationId,
          groupIdsToDelete,
          { tx },
        );

        await tx
          .delete(group)
          .where(
            and(
              eq(group.organizationId, organizationId),
              inArray(group.id, groupIdsToDelete),
            ),
          );
      }),
    );

    if (errDelete) return err(errDelete);

    return ok(undefined);
  }

  public async saveOnlyGroup(groupEntity: Group | Group[], options?: Options) {
    const db = options?.tx ?? this.db;

    const groups = Array.isArray(groupEntity) ? groupEntity : [groupEntity];

    const [, errInsert] = await tryCatch(
      db
        .insert(group)
        .values(groups.map((g) => g.values))
        .onConflictDoUpdate({
          target: group.id,
          set: buildConflictUpdateColumn(group, [
            "name",
            "slug",
            "description",
            "permissions",
            "status",
            "updatedAt",
          ]),
        }),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async save(groupEntity: Group | Group[]) {
    const groups = Array.isArray(groupEntity) ? groupEntity : [groupEntity];

    const [, errInsert] = await tryCatch(
      this.db.transaction(async (tx) => {
        await tx
          .insert(group)
          .values(groups.map((g) => g.values))
          .onConflictDoUpdate({
            target: group.id,
            set: buildConflictUpdateColumn(group, [
              "name",
              "slug",
              "description",
              "permissions",
              "status",
              "updatedAt",
            ]),
          });

        await tx
          .insert(groupMember)
          .values(groups.flatMap((g) => g.values.members))
          .onConflictDoNothing();
      }),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }
}
