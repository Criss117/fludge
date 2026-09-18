import { DatabaseService } from "@/integrations/db";
import type {
  FindAllMembersFilters,
  MemberDetail,
  MemberRepository,
  MemberSummary,
} from "@fludge/client/application/iam/domain/member.repository";
import {
  localGroup,
  localGroupMember,
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
      })
      .from(localGroupMember)
      .innerJoin(localGroup, eq(localGroup.id, localGroupMember.groupId))
      .where(
        and(
          eq(localGroupMember.memberId, memberId),
          eq(localGroupMember.organizationId, organizationId)
        )
      )
      .orderBy(desc(localGroupMember.createdAt));

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

  public async save(values: MemberSummary): Promise<void> {
    this.db.transaction((tx) => {
      tx.insert(localUser)
        .values(values.user)
        .onConflictDoUpdate({
          target: localUser.id,
          set: values.user,
        })
        .run();

      tx.insert(localMember)
        .values(values)
        .onConflictDoUpdate({
          target: localMember.id,
          set: values,
        })
        .run();
    });
  }
}
