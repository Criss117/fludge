import { DatabaseService } from "@/integrations/db";
import type {
  FindAllMembersFilters,
  MemberDetail,
  MemberRepository,
  MemberSummary,
} from "@fludge/client/application/iam/domain/member.repository";
import {
  group,
  groupMember,
  member,
  user,
} from "@fludge/db/local-schemas/iam.schema";
import {
  and,
  desc,
  eq,
  getColumns,
  ilike,
  inArray,
  like,
  notInArray,
} from "drizzle-orm";

export class SqliteMemberRepository implements MemberRepository {
  constructor(private readonly db: DatabaseService) {}

  public async delete(
    organizationId: string,
    memberId: string | string[]
  ): Promise<void> {
    const memberIds = Array.isArray(memberId) ? memberId : [memberId];

    await this.db
      .delete(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          inArray(member.id, memberIds)
        )
      );
  }

  public async findOneById(
    organizationId: string,
    memberId: string
  ): Promise<MemberDetail | null> {
    const rows = await this.db
      .select({
        ...getColumns(member),
        user: getColumns(user),
      })
      .from(member)
      .innerJoin(user, eq(user.id, member.userId))
      .where(
        and(eq(member.organizationId, organizationId), eq(member.id, memberId))
      )
      .limit(1);

    const memberData = rows.at(0);

    if (!memberData) return null;

    const memberGroups = await this.db
      .select({
        ...getColumns(group),
      })
      .from(groupMember)
      .innerJoin(group, eq(group.id, groupMember.groupId))
      .where(
        and(
          eq(groupMember.memberId, memberId),
          eq(groupMember.organizationId, organizationId)
        )
      )
      .orderBy(desc(groupMember.createdAt));

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
        ...getColumns(member),
        user: getColumns(user),
      })
      .from(member)
      .innerJoin(user, eq(user.id, member.userId))
      .where(
        and(
          eq(member.organizationId, organizationId),
          excludeIds ? notInArray(member.id, excludeIds) : undefined,
          like(user.name, "%" + searchQuery + "%")
        )
      )
      .orderBy(desc(member.createdAt));
  }

  public async save(values: MemberSummary): Promise<void> {
    this.db.transaction((tx) => {
      tx.insert(user)
        .values(values.user)
        .onConflictDoUpdate({
          target: user.id,
          set: values.user,
        })
        .run();

      tx.insert(member)
        .values(values)
        .onConflictDoUpdate({
          target: member.id,
          set: values,
        })
        .run();
    });
  }
}
