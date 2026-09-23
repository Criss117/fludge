import type { ClientSyncIamRepository } from "@fludge/sync/repositories/iam/client-sync-iam.repository";
import type { DatabaseService } from "..";
import {
  localGroup,
  localGroupMember,
  localMember,
  localOrganization,
  localUser,
} from "@fludge/db/local-schemas/shared.schema";
import { desc, inArray } from "drizzle-orm";
import type {
  IamLastSyncedAt,
  IamSyncResult,
} from "@fludge/sync/types/iam.types";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";

export class NativeSyncIamRepository implements ClientSyncIamRepository {
  constructor(private readonly db: DatabaseService) {}

  private async getLastSyncedUser() {
    const row = await this.db
      .select()
      .from(localUser)
      .orderBy(desc(localUser.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  private async getLastSyncedGroup() {
    const row = await this.db
      .select()
      .from(localGroup)
      .orderBy(desc(localGroup.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  private async getLastSyncedMember() {
    const row = await this.db
      .select()
      .from(localMember)
      .orderBy(desc(localMember.createdAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  private async getLastSyncedOrganization() {
    const row = await this.db
      .select()
      .from(localOrganization)
      .orderBy(desc(localOrganization.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  public async getLastSyncedAt(): Promise<IamLastSyncedAt> {
    const [user, group, member, organization] = await Promise.all([
      this.getLastSyncedUser(),
      this.getLastSyncedGroup(),
      this.getLastSyncedMember(),
      this.getLastSyncedOrganization(),
    ]);

    return {
      user: user?.updatedAt ?? null,
      group: group?.updatedAt ?? null,
      member: member?.createdAt ?? null,
      organization: organization?.updatedAt ?? null,
    };
  }

  public async saveAll(values: IamSyncResult): Promise<void> {
    this.db.transaction((tx) => {
      if (values.users.length > 0) {
        tx.insert(localUser)
          .values(values.users)
          .onConflictDoUpdate({
            target: localUser.id,
            set: buildConflictUpdateColumn(localUser, [
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
        tx.insert(localOrganization)
          .values(values.organizations)
          .onConflictDoUpdate({
            target: localOrganization.id,
            set: buildConflictUpdateColumn(localOrganization, [
              "name",
              "slug",
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
        tx.insert(localMember)
          .values(values.members)
          .onConflictDoNothing()
          .run();
      }

      if (values.groups.length > 0) {
        tx.delete(localGroupMember)
          .where(
            inArray(
              localGroupMember.groupId,
              values.groups.map((g) => g.id)
            )
          )
          .run();

        tx.insert(localGroup)
          .values(values.groups)
          .onConflictDoUpdate({
            target: localGroup.id,
            set: buildConflictUpdateColumn(localGroup, [
              "name",
              "slug",
              "description",
              "permissions",
              "status",
              "updatedAt",
            ]),
          })
          .run();

        tx.insert(localGroupMember)
          .values(values.groups.flatMap((g) => g.members.map((m) => m)))
          .onConflictDoNothing()
          .run();
      }
    });
  }
}
