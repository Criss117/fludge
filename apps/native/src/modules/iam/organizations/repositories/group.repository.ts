import { DatabaseService } from "@/integrations/db";
import {
  GroupDetail,
  GroupSummary,
} from "@fludge/client/application/iam/domain/entities";
import type {
  FindAllGroupsFilters,
  GroupRepository,
} from "@fludge/client/application/iam/domain/group.repository";
import {
  localGroup,
  localGroupMember,
  LocalGroup,
  localMember,
  localUser,
} from "@fludge/db/local-schemas/shared.schema";
import {
  buildConflictUpdateColumn,
  jsonObject,
} from "@fludge/db/utils/build-queries";

import {
  and,
  count,
  desc,
  eq,
  getColumns,
  inArray,
  like,
  notInArray,
  or,
  sql,
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
      .select({
        ...getColumns(localGroup),
        totalMembers: count(localGroupMember.groupId),
      })
      .from(localGroup)
      .leftJoin(localGroupMember, eq(localGroupMember.groupId, localGroup.id))
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
      .innerJoin(
        localMember,
        and(
          eq(localMember.id, localGroupMember.memberId),
          eq(localMember.organizationId, organizationId)
        )
      )
      .innerJoin(localUser, eq(localUser.id, localMember.userId))
      .where(
        and(
          eq(localGroupMember.organizationId, organizationId),
          eq(localGroupMember.groupId, groupId)
        )
      )
      .orderBy(desc(localMember.createdAt));

    return {
      ...groupData,
      members: memberRows,
    };
  }

  public async save(values: LocalGroup | LocalGroup[]): Promise<void> {
    const groupsArray = Array.isArray(values) ? values : [values];

    const groups: Omit<LocalGroup, "members">[] = [];
    const members: LocalGroup["members"] = [];

    for (const group of groupsArray) {
      const { members: groupMembers, ...groupValues } = group;

      groups.push(groupValues);
      members.push(...groupMembers);
    }

    await this.db.transaction((tx) => {
      tx.insert(localGroup)
        .values(groups)
        .onConflictDoUpdate({
          target: localGroup.id,
          set: buildConflictUpdateColumn(localGroup, [
            "name",
            "slug",
            "status",
            "description",
          ]),
        })
        .run();

      if (members.length > 0) {
        tx.delete(localGroupMember)
          .where(
            inArray(
              localGroupMember.groupId,
              groups.map((g) => g.id)
            )
          )
          .run();

        tx.insert(localGroupMember).values(members).run();
      }
    });
  }

  public async delete(group: LocalGroup | LocalGroup[]): Promise<void> {
    const groups = Array.isArray(group) ? group : [group];

    await this.db
      .delete(localGroup)
      .where(
        or(
          ...groups.map((g) =>
            and(
              eq(localGroup.organizationId, g.organizationId),
              eq(localGroup.id, g.id)
            )
          )
        )
      );
  }
}
