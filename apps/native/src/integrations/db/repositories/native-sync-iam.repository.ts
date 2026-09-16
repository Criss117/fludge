import { DatabaseService } from "..";
import {
  group,
  groupMember,
  member,
  organization,
  user,
} from "@fludge/db/local-schemas/iam.schema";
import { desc } from "drizzle-orm";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { SyncIamAllItems } from "@fludge/sync/repositories/iam/server-sync-iam.repository";
import {
  ClientSyncIamRepository,
  GetIamLastSyncedAt,
} from "@fludge/sync/repositories/iam/client-sync-iam.repository";

export class NativeSyncIamRepository implements ClientSyncIamRepository {
  constructor(private readonly db: DatabaseService) {}

  private async getLastSyncedUser() {
    const row = await this.db
      .select()
      .from(user)
      .orderBy(desc(user.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  private async getLastSyncedGroup() {
    const row = await this.db
      .select()
      .from(group)
      .orderBy(desc(group.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  private async getLastSyncedMember() {
    const row = await this.db
      .select()
      .from(member)
      .orderBy(desc(member.createdAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  private async getLastSyncedOrganization() {
    const row = await this.db
      .select()
      .from(organization)
      .orderBy(desc(organization.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  private async getLastSyncedGroupMember() {
    const row = await this.db
      .select()
      .from(groupMember)
      .orderBy(desc(groupMember.createdAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  public async getLastSyncedAt(): Promise<GetIamLastSyncedAt> {
    const [user, group, member, organization, groupMember] = await Promise.all([
      this.getLastSyncedUser(),
      this.getLastSyncedGroup(),
      this.getLastSyncedMember(),
      this.getLastSyncedOrganization(),
      this.getLastSyncedGroupMember(),
    ]);

    return {
      user,
      group,
      member,
      organization,
      groupMember,
    };
  }

  public async saveAll(values: SyncIamAllItems): Promise<void> {
    this.db.transaction((tx) => {
      if (values.users.length > 0) {
        tx.insert(user)
          .values(values.users)
          .onConflictDoUpdate({
            target: user.id,
            set: buildConflictUpdateColumn(user, [
              "name",
              "email",
              "image",
              "updatedAt",
              "phone",
            ]),
          })
          .run();
      }

      if (values.organizations.length > 0) {
        tx.insert(organization)
          .values(values.organizations)
          .onConflictDoUpdate({
            target: organization.id,
            set: buildConflictUpdateColumn(organization, [
              "name",
              "slug",
              "logo",
              "metadata",
              "legalName",
              "address",
              "phone",
              "status",
              "updatedAt",
            ]),
          })
          .run();
      }

      if (values.members.length > 0) {
        tx.insert(member).values(values.members).onConflictDoNothing().run();
      }

      if (values.groups.length > 0) {
        tx.insert(group)
          .values(values.groups)
          .onConflictDoUpdate({
            target: group.id,
            set: buildConflictUpdateColumn(group, [
              "name",
              "slug",
              "description",
              "permissions",
              "status",
              "updatedAt",
            ]),
          })
          .run();
      }

      if (values.groupMembers.length > 0) {
        tx.insert(groupMember)
          .values(values.groupMembers)
          .onConflictDoNothing()
          .run();
      }
    });
  }
}
