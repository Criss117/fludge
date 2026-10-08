import type { ClientSyncIamRepository } from "@fludge/sync/repositories/iam/client-sync-iam.repository";
import type { DatabaseService } from "..";
import {
  LocalGroup,
  localGroup,
  localGroupMember,
  localMember,
  localOrganization,
  localUser,
  type LocalMember,
} from "@fludge/db/local-schemas/shared.schema";
import { desc, inArray } from "drizzle-orm";
import type {
  IamLastSyncedAt,
  IamSyncResult,
} from "@fludge/sync/types/iam.types";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";

export class NativeSyncIamRepository implements ClientSyncIamRepository {
  constructor(private readonly db: DatabaseService) {}

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
    const [group, member, organization] = await Promise.all([
      this.getLastSyncedGroup(),
      this.getLastSyncedMember(),
      this.getLastSyncedOrganization(),
    ]);

    return {
      group: group?.updatedAt ?? null,
      member: member?.createdAt ?? null,
      organization: organization?.updatedAt ?? null,
    };
  }

  public async saveAll(values: IamSyncResult): Promise<void> {
    this.db.transaction((tx) => {
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
        const members: Omit<LocalMember, "user">[] = [];
        const users: LocalMember["user"][] = [];

        for (const member of values.members) {
          const { user: memberUser, ...memberValues } = member;

          members.push(memberValues);
          users.push(memberUser);
        }

        tx.insert(localUser)
          .values(users)
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

        tx.insert(localMember)
          .values(values.members)
          .onConflictDoNothing()
          .run();
      }

      if (values.groups.length > 0) {
        const groups: Omit<LocalGroup, "members">[] = [];
        const groupMembers: LocalGroup["members"] = [];

        for (const group of values.groups) {
          const { members, ...groupValues } = group;

          groups.push(groupValues);
          groupMembers.push(...members);
        }

        tx.insert(localGroup)
          .values(groups)
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

        if (groupMembers.length > 0) {
          tx.delete(localGroupMember)
            .where(
              inArray(
                localGroupMember.groupId,
                values.groups.map((g) => g.id),
              ),
            )
            .run();

          tx.insert(localGroupMember)
            .values(values.groups.flatMap((g) => g.members.map((m) => m)))
            .onConflictDoNothing()
            .run();
        }
      }
    });
  }
}
