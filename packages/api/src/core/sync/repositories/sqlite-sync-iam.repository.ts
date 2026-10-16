import type { DatabaseService } from "@fludge/db";
import type {
  LocalGroup,
  LocalMember,
  LocalOrganization,
} from "@fludge/db/local-schemas/shared.schema";
import { user } from "@fludge/db/schema/auth.schema";
import {
  group,
  groupMember,
  type GroupMemberSelect,
  member,
  organization,
} from "@fludge/db/schema/iam.schema";
import { jsonObject } from "@fludge/db/utils/build-queries";
import type { ServerSyncIamRepository } from "@fludge/sync/repositories/iam/server-sync-iam.repository";
import type { IamSyncCursors, IamSyncResult } from "@fludge/sync/types/iam.types";
import {
  paginateSync,
  type PaginateSyncQueryFn,
  type SyncCursor,
} from "@fludge/sync/types/shared.types";
import { and, asc, eq, getColumns, gt, inArray, or, sql } from "drizzle-orm";

const after = <T extends { updatedAt: any; id: any }>(t: T, c: SyncCursor | null) =>
  c
    ? or(gt(t.updatedAt, c.updatedAt), and(eq(t.updatedAt, c.updatedAt), gt(t.id, c.id)))
    : undefined;

export class SQLiteSyncIamRepository implements ServerSyncIamRepository {
  constructor(private readonly db: DatabaseService) {}

  private organizationsQuery(organizationIds: string[]): PaginateSyncQueryFn<LocalOrganization> {
    return (cursor, limit) =>
      this.db
        .select()
        .from(organization)
        .where(and(inArray(organization.id, organizationIds), after(organization, cursor)))
        .orderBy(asc(organization.updatedAt), asc(organization.id))
        .limit(limit);
  }

  private membersQuery(organizationIds: string[]): PaginateSyncQueryFn<LocalMember> {
    return (cursor, limit) =>
      this.db
        .select({
          ...getColumns(member),
          user: getColumns(user),
        })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId)) // ejemplo de join
        .where(and(inArray(member.organizationId, organizationIds), after(member, cursor)))
        .orderBy(asc(member.updatedAt), asc(member.id))
        .limit(limit);
  }

  private groupsQuery(organizationIds: string[]): PaginateSyncQueryFn<LocalGroup> {
    return async (cursor, limit) => {
      const rows = await this.db
        .select({
          ...getColumns(group),
          members: sql<string>`
          json_group_array(${jsonObject(groupMember)})
          FILTER (WHERE ${groupMember.groupId} IS NOT NULL)
        `.as("members"),
        })
        .from(group)
        .leftJoin(groupMember, eq(group.id, groupMember.groupId))
        .where(and(inArray(group.organizationId, organizationIds), after(group, cursor)))
        .groupBy(group.id)
        .orderBy(asc(group.updatedAt), asc(group.id))
        .limit(limit);

      return rows.map((g) => ({
        ...g,
        members: (JSON.parse(g.members) as GroupMemberSelect[]).map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        })),
      }));
    };
  }

  public async findAllByUpdatedAt(
    organizationIds: string[],
    lastSyncedAt: IamSyncCursors,
    limit = 500,
  ): Promise<IamSyncResult> {
    const [organizations, members, groups] = await Promise.all([
      paginateSync(this.organizationsQuery(organizationIds), lastSyncedAt.organization, limit),
      paginateSync(this.membersQuery(organizationIds), lastSyncedAt.member, limit),
      paginateSync(this.groupsQuery(organizationIds), lastSyncedAt.group, limit),
    ]);

    return {
      organizations,
      members,
      groups,
    };
  }
}
