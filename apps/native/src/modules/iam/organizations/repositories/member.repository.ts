import { DatabaseService } from "@/integrations/db";
import {
  MemberDetail,
  MemberSummary,
} from "@fludge/client/application/iam/domain/entities";
import type {
  FindAllMembersFilters,
  MemberRepository,
} from "@fludge/client/application/iam/domain/member.repository";
import {
  localGroup,
  localGroupMember,
  localMember,
  localUser,
} from "@fludge/db/local-schemas/shared.schema";
import { groupMember } from "@fludge/db/schema/iam.schema";
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
} from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

const countGroupMembersAlias = alias(groupMember, "count_group_members");

export class SqliteMemberRepository implements MemberRepository {
  constructor(private readonly db: DatabaseService) {}

  public async delete(
    organizationId: string,
    memberId: string | string[]
  ): Promise<void> {
    const memberIds = Array.isArray(memberId) ? memberId : [memberId];

    await this.db
      .delete(localMember)
      .where(
        and(
          eq(localMember.organizationId, organizationId),
          inArray(localMember.id, memberIds)
        )
      );
  }

  public async findOneById(
    organizationId: string,
    memberId: string
  ): Promise<MemberDetail | null> {
    const rows = await this.db
      .select({
        ...getColumns(localMember),
        user: getColumns(localUser),
      })
      .from(localMember)
      .innerJoin(localUser, eq(localUser.id, localMember.userId))
      .where(
        and(
          eq(localMember.organizationId, organizationId),
          eq(localMember.id, memberId)
        )
      )
      .limit(1);

    const memberData = rows.at(0);

    if (!memberData) return null;

    const memberGroups = await this.db
      .select({
        ...getColumns(localGroup),
        totalMembers: count(countGroupMembersAlias.groupId),
      })
      .from(localGroupMember)
      .innerJoin(localGroup, eq(localGroup.id, localGroupMember.groupId))
      .leftJoin(
        countGroupMembersAlias,
        eq(countGroupMembersAlias.groupId, localGroup.id)
      )
      .where(
        and(
          eq(localGroupMember.memberId, memberId),
          eq(localGroupMember.organizationId, organizationId)
        )
      )
      .orderBy(desc(localGroup.createdAt))
      .groupBy(localGroup.id);

    return {
      ...memberData,
      groups: memberGroups,
    };
  }

  public async findAll(
    organizationId: string,
    filters?: FindAllMembersFilters
  ): Promise<MemberSummary[]> {
    const excludeIds = filters?.excludeIds;
    const searchQuery = filters?.searchQuery ?? "";

    return this.db
      .select({
        ...getColumns(localMember),
        user: getColumns(localUser),
      })
      .from(localMember)
      .innerJoin(localUser, eq(localUser.id, localMember.userId))
      .where(
        and(
          eq(localMember.organizationId, organizationId),
          excludeIds ? notInArray(localMember.id, excludeIds) : undefined,
          like(localUser.name, "%" + searchQuery + "%")
        )
      )
      .orderBy(desc(localMember.createdAt));
  }

  public async save(values: MemberSummary | MemberSummary[]): Promise<void> {
    const membersArray = Array.isArray(values) ? values : [values];

    const members: Omit<MemberSummary, "user">[] = [];
    const users: MemberSummary["user"][] = [];

    for (const member of membersArray) {
      const { user: memberUser, ...memberValues } = member;

      members.push(memberValues);
      users.push(memberUser);
    }

    this.db.transaction((tx) => {
      tx.insert(localUser)
        .values(users)
        .onConflictDoUpdate({
          target: localUser.id,
          set: buildConflictUpdateColumn(localUser, [
            "name",
            "phone",
            "updatedAt",
          ]),
        })
        .run();

      tx.insert(localMember)
        .values(members)
        .onConflictDoUpdate({
          target: localMember.id,
          set: buildConflictUpdateColumn(localMember, ["status", "updatedAt"]),
        })
        .run();
    });
  }
}
