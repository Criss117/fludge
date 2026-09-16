import type { DatabaseService } from "@fludge/db";
import { user } from "@fludge/db/schema/auth.schema";
import {
  group,
  groupMember,
  member,
  organization,
} from "@fludge/db/schema/iam.schema";
import type {
  LocalGroup,
  LocalGroupMember,
  LocalMember,
  LocalOrganization,
  LocalUser,
} from "@fludge/sync/entities/iam.entities";
import type {
  IamLastSyncedAt,
  ServerSyncIamRepository,
} from "@fludge/sync/repositories/iam/server-sync-iam.repository";
import { and, inArray, gt } from "drizzle-orm";

export class SyncIamRepository implements ServerSyncIamRepository {
  constructor(private readonly db: DatabaseService) {}

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
  ): Promise<LocalMember[]> {
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
    lastSyncedAt: IamLastSyncedAt["groupMember"],
  ): Promise<LocalGroupMember[]> {
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
    lastSyncedAt: IamLastSyncedAt["user"],
  ): Promise<LocalUser[]> {
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
    lastSyncedAt: IamLastSyncedAt["group"],
  ): Promise<LocalGroup[]> {
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
    lastSyncedAt: IamLastSyncedAt,
  ): Promise<{
    users: LocalUser[];
    groups: LocalGroup[];
    members: LocalMember[];
    organizations: LocalOrganization[];
    groupMembers: LocalGroupMember[];
  }> {
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
