import { DatabaseService } from "@/integrations/db";
import type {
  FindAllGroupsFilters,
  GroupDetail,
  GroupRepository,
  GroupSummary,
} from "@fludge/client/application/iam/domain/group.repository";
import {
  localGroup,
  localGroupMember,
  LocalGroupSelect,
  localMember,
  localUser,
} from "@fludge/db/local-schemas/shared.schema";

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
      .from(localGroup)
      .where(
        and(
          eq(localGroup.organizationId, organizationId),
          excludeIds ? notInArray(localGroup.id, excludeIds) : undefined,
          like(localGroup.name, "%" + searchQuery + "%")
        )
      )
      .groupBy(localGroup.id)
      .orderBy(desc(localGroup.updatedAt));

    return rows;
  }

  public async findOneById(
    organizationId: string,
    groupId: string
  ): Promise<GroupDetail | null> {
    const rows = await this.db
      .select()
      .from(localGroup)
      .where(
        and(
          eq(localGroup.organizationId, organizationId),
          eq(localGroup.id, groupId)
        )
      )
      .limit(1);

    const groupData = rows.at(0);

    if (!groupData) return null;

    const memberRows = await this.db
      .select({
        ...getColumns(localMember),
        user: getColumns(localUser),
      })
      .from(localGroupMember)
      .innerJoin(localMember, eq(localMember.id, localGroupMember.memberId))
      .innerJoin(localUser, eq(localUser.id, localMember.userId))
      .where(eq(localGroupMember.groupId, groupId))
      .orderBy(desc(localMember.createdAt));

    return {
      ...groupData,
      members: memberRows,
    };
  }

  public async save(values: LocalGroupSelect): Promise<void> {
    await this.db.insert(localGroup).values(values).onConflictDoUpdate({
      target: localGroup.id,
      set: values,
    });
  }

  public async delete(
    organizationId: string,
    groupIds: string[]
  ): Promise<void> {
    await this.db
      .delete(localGroup)
      .where(
        and(
          eq(localGroup.organizationId, organizationId),
          inArray(localGroup.id, groupIds)
        )
      );
  }
}
