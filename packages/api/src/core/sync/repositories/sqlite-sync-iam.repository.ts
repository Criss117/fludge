import type { DatabaseService } from "@fludge/db";
import { user } from "@fludge/db/schema/auth.schema";
import {
  group,
  groupMember,
  member,
  organization,
  type GroupMemberSelect,
} from "@fludge/db/schema/iam.schema";
import { jsonObject } from "@fludge/db/utils/build-queries";
import type { ServerSyncIamRepository } from "@fludge/sync/repositories/iam/server-sync-iam.repository";
import type {
  IamLastSyncedAt,
  IamSyncResult,
} from "@fludge/sync/types/iam.types";
import { and, desc, eq, getColumns, gt, inArray, sql } from "drizzle-orm";

export class SQLiteSyncIamRepository implements ServerSyncIamRepository {
  constructor(private readonly db: DatabaseService) {}

  private async findUsers(
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAt["user"],
  ) {
    return this.db
      .select({
        ...getColumns(user),
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(
        and(
          inArray(member.organizationId, organizationIds),
          lastSyncedAt ? gt(user.updatedAt, lastSyncedAt) : undefined,
        ),
      )
      .orderBy(desc(user.updatedAt));
  }

  private async findOrganizations(
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAt["organization"],
  ) {
    return this.db
      .select()
      .from(organization)
      .where(
        and(
          inArray(organization.id, organizationIds),
          lastSyncedAt ? gt(organization.updatedAt, lastSyncedAt) : undefined,
        ),
      );
  }

  private async findMembers(
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAt["member"],
  ) {
    return this.db
      .select()
      .from(member)
      .where(
        and(
          inArray(member.organizationId, organizationIds),
          lastSyncedAt ? gt(member.createdAt, lastSyncedAt) : undefined,
        ),
      )
      .orderBy(desc(member.createdAt));
  }

  private async findGroups(
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAt["group"],
  ) {
    const rows = await this.db
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
      .where(
        and(
          inArray(group.organizationId, organizationIds),
          lastSyncedAt ? gt(group.updatedAt, lastSyncedAt) : undefined,
        ),
      )
      .orderBy(desc(group.updatedAt));

    return rows
      .map((g) => {
        const members = (JSON.parse(g.members) as GroupMemberSelect[]).map(
          (m) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          }),
        );

        return {
          ...g,
          members,
        };
      })
      .filter((g) => g.id !== null);
  }

  public async findAllByUpdatedAt(
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAt,
  ): Promise<IamSyncResult> {
    const [users, organizations, members, groups] = await Promise.all([
      this.findUsers(organizationIds, lastSyncedAt.user),
      this.findOrganizations(organizationIds, lastSyncedAt.organization),
      this.findMembers(organizationIds, lastSyncedAt.member),
      this.findGroups(organizationIds, lastSyncedAt.group),
    ]);

    return {
      users,
      organizations,
      members,
      groups,
    };
  }
}
