import type { DatabaseService } from "@fludge/db";
import { user } from "@fludge/db/schema/auth.schema";
import {
  group,
  groupMember,
  member,
  organization,
} from "@fludge/db/schema/iam.schema";

import type { ServerSyncIamRepository } from "@fludge/sync/repositories/iam/server-sync-iam.repository";
import type {
  IamLastSyncedAtQuery,
  IamSyncAllItems,
} from "@fludge/sync/types/iam.types";
import { and, inArray, gt } from "drizzle-orm";

export class SyncIamRepository implements ServerSyncIamRepository {
  constructor(private readonly db: DatabaseService) {}

  private async findOrganizations(
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAtQuery["organization"],
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
    lastSyncedAt: IamLastSyncedAtQuery["member"],
  ) {
    return this.db
      .select()
      .from(member)
      .where(
        and(
          inArray(member.organizationId, organizationIds),
          lastSyncedAt ? gt(member.createdAt, lastSyncedAt) : undefined,
        ),
      );
  }

  private async findGroupMembers(
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAtQuery["groupMember"],
  ) {
    return this.db
      .select()
      .from(groupMember)
      .where(
        and(
          inArray(groupMember.organizationId, organizationIds),
          lastSyncedAt ? gt(groupMember.createdAt, lastSyncedAt) : undefined,
        ),
      );
  }

  private async findUsers(
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAtQuery["user"],
  ) {
    return this.db
      .select()
      .from(user)
      .where(
        and(
          inArray(
            user.id,
            this.db
              .select({ id: member.userId })
              .from(member)
              .where(inArray(member.organizationId, organizationIds)),
          ),
          lastSyncedAt ? gt(user.updatedAt, lastSyncedAt) : undefined,
        ),
      );
  }

  private async findGroups(
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAtQuery["group"],
  ) {
    return this.db
      .select()
      .from(group)
      .where(
        and(
          inArray(group.organizationId, organizationIds),
          lastSyncedAt ? gt(group.updatedAt, lastSyncedAt) : undefined,
        ),
      );
  }

  public async findAllItems(
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAtQuery,
  ): Promise<IamSyncAllItems> {
    const organizationsPromise = this.findOrganizations(
      organizationIds,
      lastSyncedAt.organization,
    );

    const membersPromise = this.findMembers(
      organizationIds,
      lastSyncedAt.member,
    );

    const groupsPromise = this.findGroups(organizationIds, lastSyncedAt.group);

    const usersPromise = this.findUsers(organizationIds, lastSyncedAt.user);

    const groupMembersPromise = this.findGroupMembers(
      organizationIds,
      lastSyncedAt.groupMember,
    );

    const [organizations, members, groups, users, groupMembers] =
      await Promise.all([
        organizationsPromise,
        membersPromise,
        groupsPromise,
        usersPromise,
        groupMembersPromise,
      ]);

    return {
      users,
      groups,
      members,
      organizations,
      groupMembers,
    };
  }
}
