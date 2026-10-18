import type { GroupDetail, GroupSummary } from "@fludge/client/iam/domain/entities";
import type {
  FindAllGroupsFilters,
  GroupRepository,
} from "@fludge/client/iam/domain/group.repository";
import type { LocalGroup } from "@fludge/db/local-schemas/shared.schema";
import {
  localGroup,
  localGroupMember,
  localMember,
  localUser,
} from "@fludge/db/local-schemas/shared.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { type RepositoryError, toRepositoryError } from "@fludge/utils/errors/repository.error";
import { type Result, tryCatch } from "@fludge/utils/trycatch";
import { and, count, desc, eq, getColumns, inArray, like, notInArray, or } from "drizzle-orm";

import type { DatabaseService } from "@/integrations/db";

export class NativeGroupRepository implements GroupRepository {
  constructor(private readonly db: DatabaseService) {}

  public async clearAll(): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        this.db.transaction((tx) => {
          tx.delete(localGroupMember).run();
          tx.delete(localGroup).run();
        });
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.groups.isr_on_delete", raw),
      },
    );
  }

  public async findAll(
    organizationId: string,
    filters?: FindAllGroupsFilters,
  ): Promise<Result<GroupSummary[], RepositoryError>> {
    return tryCatch(
      () => {
        const excludeIds = filters?.excludeIds;
        const searchQuery = filters?.searchQuery ?? "";

        return this.db
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
              like(localGroup.name, "%" + searchQuery + "%"),
            ),
          )
          .groupBy(localGroup.id)
          .orderBy(desc(localGroup.updatedAt))
          .all();
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.groups.isr_on_find", raw),
      },
    );
  }

  public async findOneById(
    organizationId: string,
    groupId: string,
  ): Promise<Result<GroupDetail | null, RepositoryError>> {
    return tryCatch(
      () => {
        const groupData = this.db
          .select()
          .from(localGroup)
          .where(and(eq(localGroup.organizationId, organizationId), eq(localGroup.id, groupId)))
          .limit(1)
          .get();

        if (!groupData) return null;

        const memberRows = this.db
          .select({
            ...getColumns(localMember),
            user: getColumns(localUser),
          })
          .from(localGroupMember)
          .innerJoin(
            localMember,
            and(
              eq(localMember.id, localGroupMember.memberId),
              eq(localMember.organizationId, organizationId),
            ),
          )
          .innerJoin(localUser, eq(localUser.id, localMember.userId))
          .where(
            and(
              eq(localGroupMember.organizationId, organizationId),
              eq(localGroupMember.groupId, groupId),
            ),
          )
          .orderBy(desc(localMember.createdAt))
          .all();

        return {
          ...groupData,
          members: memberRows,
        };
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.groups.isr_on_find", raw),
      },
    );
  }

  public async save(values: LocalGroup | LocalGroup[]): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        const groupsArray = Array.isArray(values) ? values : [values];

        const groups: Omit<LocalGroup, "members">[] = [];
        const members: LocalGroup["members"] = [];

        for (const group of groupsArray) {
          const { members: groupMembers, ...groupValues } = group;

          groups.push(groupValues);
          members.push(...groupMembers);
        }

        this.db.transaction((tx) => {
          tx.insert(localGroup)
            .values(groups)
            .onConflictDoUpdate({
              target: localGroup.id,
              set: buildConflictUpdateColumn(localGroup, [
                "name",
                "slug",
                "status",
                "description",
                "permissions",
                "updatedAt",
              ]),
            })
            .run();

          if (members.length > 0) {
            tx.delete(localGroupMember)
              .where(
                inArray(
                  localGroupMember.groupId,
                  groups.map((g) => g.id),
                ),
              )
              .run();

            tx.insert(localGroupMember).values(members).run();
          }
        });
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.groups.isr_on_save", raw),
      },
    );
  }

  public async delete(group: LocalGroup | LocalGroup[]): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        const groups = Array.isArray(group) ? group : [group];

        this.db
          .delete(localGroup)
          .where(
            or(
              ...groups.map((g) =>
                and(eq(localGroup.organizationId, g.organizationId), eq(localGroup.id, g.id)),
              ),
            ),
          )
          .run();
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.groups.isr_on_delete", raw),
      },
    );
  }
}
