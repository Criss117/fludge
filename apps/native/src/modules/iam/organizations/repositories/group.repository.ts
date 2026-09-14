import { DatabaseService } from "@/integrations/db";
import type {
  FindAllGroupsFilters,
  GroupDetail,
  GroupRepository,
  GroupSummary,
} from "@fludge/client/application/iam/domain/group.repository";
import {
  group,
  groupMember,
  member,
  user,
} from "@fludge/db/local-schemas/iam.schema";
import { LocalGroup } from "@fludge/sync/entities/iam.entities";

import {
  and,
  desc,
  eq,
  getColumns,
  inArray,
  like,
  notInArray,
} from "drizzle-orm";

export class SqliteGroupRepository implements GroupRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findAll(
    organizationId: string,
    filters?: FindAllGroupsFilters
  ): Promise<GroupSummary[]> {
    const excludeIds = filters?.excludeIds;
    const searchQuery = filters?.searchQuery ?? "";

    const rows = await this.db
      .select()
      .from(group)

      .where(
        and(
          eq(group.organizationId, organizationId),
          excludeIds ? notInArray(group.id, excludeIds) : undefined,
          like(group.name, "%" + searchQuery + "%")
        )
      )
      .groupBy(group.id)
      .orderBy(desc(group.updatedAt));

    return rows;
  }

  public async findOneById(
    organizationId: string,
    groupId: string
  ): Promise<GroupDetail | null> {
    const rows = await this.db
      .select()
      .from(group)
      .where(
        and(eq(group.organizationId, organizationId), eq(group.id, groupId))
      )
      .limit(1);

    const groupData = rows.at(0);

    if (!groupData) return null;

    const memberRows = await this.db
      .select({
        ...getColumns(member),
        user: getColumns(user),
      })
      .from(groupMember)
      .innerJoin(member, eq(member.id, groupMember.memberId))
      .innerJoin(user, eq(user.id, member.userId))
      .where(eq(groupMember.groupId, groupId))
      .orderBy(desc(member.createdAt));

    return {
      ...groupData,
      members: memberRows,
    };
  }

  public async save(values: LocalGroup): Promise<void> {
    await this.db.insert(group).values(values).onConflictDoUpdate({
      target: group.id,
      set: values,
    });
  }

  public async delete(
    organizationId: string,
    groupIds: string[]
  ): Promise<void> {
    await this.db
      .delete(group)
      .where(
        and(
          eq(group.organizationId, organizationId),
          inArray(group.id, groupIds)
        )
      );
  }
}
