import type { MemberDetail, MemberSummary } from "@fludge/client/iam/domain/entities";
import type {
  FindAllMembersFilters,
  MemberRepository,
} from "@fludge/client/iam/domain/member.repository";
import type { LocalMember } from "@fludge/db/local-schemas/shared.schema";
import {
  localGroup,
  localGroupMember,
  localMember,
  localUser,
} from "@fludge/db/local-schemas/shared.schema";
import { groupMember } from "@fludge/db/schema/iam.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { type RepositoryError, toRepositoryError } from "@fludge/utils/errors/repository.error";
import { type Result, tryCatch } from "@fludge/utils/trycatch";
import { and, count, desc, eq, getColumns, inArray, like, notInArray } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

import type { DatabaseService } from "@/integrations/db";

const countGroupMembersAlias = alias(groupMember, "count_group_members");

export class NativeMemberRepository implements MemberRepository {
  constructor(private readonly db: DatabaseService) {}

  public async clearAll(): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        this.db.transaction((tx) => {
          tx.delete(localMember).run();

          tx.delete(localUser).where(eq(localUser.isRoot, false)).run();
        });
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.members.isr_on_delete", raw),
      },
    );
  }

  public async delete(
    organizationId: string,
    memberId: string | string[],
  ): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        const memberIds = Array.isArray(memberId) ? memberId : [memberId];

        this.db
          .delete(localMember)
          .where(
            and(eq(localMember.organizationId, organizationId), inArray(localMember.id, memberIds)),
          )
          .run();
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.members.isr_on_delete", raw),
      },
    );
  }

  public async findOneById(
    organizationId: string,
    memberId: string,
  ): Promise<Result<MemberDetail | null, RepositoryError>> {
    return tryCatch(
      async () => {
        const memberData = this.db
          .select({
            ...getColumns(localMember),
            user: getColumns(localUser),
          })
          .from(localMember)
          .innerJoin(localUser, eq(localUser.id, localMember.userId))
          .where(and(eq(localMember.organizationId, organizationId), eq(localMember.id, memberId)))
          .limit(1)
          .get();

        if (!memberData) return null;

        const memberGroups = await this.db
          .select({
            ...getColumns(localGroup),
            totalMembers: count(countGroupMembersAlias.groupId),
          })
          .from(localGroupMember)
          .innerJoin(localGroup, eq(localGroup.id, localGroupMember.groupId))
          .leftJoin(countGroupMembersAlias, eq(countGroupMembersAlias.groupId, localGroup.id))
          .where(
            and(
              eq(localGroupMember.memberId, memberId),
              eq(localGroupMember.organizationId, organizationId),
            ),
          )
          .orderBy(desc(localGroup.createdAt))
          .groupBy(localGroup.id);

        return {
          ...memberData,
          groups: memberGroups,
        };
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.members.isr_on_find", raw),
      },
    );
  }

  public async findAll(
    organizationId: string,
    filters?: FindAllMembersFilters,
  ): Promise<Result<MemberSummary[], RepositoryError>> {
    return tryCatch(
      () => {
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
              like(localUser.name, "%" + searchQuery + "%"),
            ),
          )
          .orderBy(desc(localMember.createdAt))
          .all();
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.members.isr_on_find", raw),
      },
    );
  }

  public async save(values: LocalMember | LocalMember[]): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        const membersArray = Array.isArray(values) ? values : [values];

        const members: Omit<LocalMember, "user">[] = [];
        const users: LocalMember["user"][] = [];

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
              set: buildConflictUpdateColumn(localUser, ["name", "phone", "updatedAt"]),
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
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.members.isr_on_save", raw),
      },
    );
  }
}
