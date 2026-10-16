import {
  type LocalGroup,
  localGroup,
  localGroupMember,
  type LocalMember,
  localMember,
  localOrganization,
  localUser,
} from "@fludge/db/local-schemas/shared.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { ClientSyncIamRepository } from "@fludge/sync/repositories/iam/client-sync-iam.repository";
import type { IamSyncCursors, IamSyncResult } from "@fludge/sync/types/iam.types";
import { inArray } from "drizzle-orm";

import type { DatabaseService } from "..";
import type { NativeSyncStateRepository } from "./native-sync-state.repository";

export class NativeSyncIamRepository implements ClientSyncIamRepository {
  constructor(
    private readonly db: DatabaseService,
    private readonly syncStateRepository: NativeSyncStateRepository,
  ) {}

  public async getLastSyncedAt(): Promise<IamSyncCursors> {
    const [group, member, organization] = await Promise.all([
      this.syncStateRepository.find("groups"),
      this.syncStateRepository.find("members"),
      this.syncStateRepository.find("organizations"),
    ]);

    return {
      group: group?.cursor ?? null,
      member: member?.cursor ?? null,
      organization: organization?.cursor ?? null,
    };
  }

  public async saveAll({ groups, members, organizations }: IamSyncResult): Promise<void> {
    this.db.transaction((tx) => {
      if (organizations.items.length > 0) {
        tx.insert(localOrganization)
          .values(organizations.items)
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

        this.syncStateRepository.save("organizations", organizations.nextCursor, tx);
      }

      if (members.items.length > 0) {
        const membersList: Omit<LocalMember, "user">[] = [];
        const usersList: LocalMember["user"][] = [];

        for (const member of members.items) {
          const { user: memberUser, ...memberValues } = member;

          membersList.push(memberValues);
          usersList.push(memberUser);
        }

        tx.insert(localUser)
          .values(usersList)
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

        tx.insert(localMember).values(membersList).onConflictDoNothing().run();

        this.syncStateRepository.save("members", members.nextCursor, tx);
      }

      if (groups.items.length > 0) {
        const groupsList: Omit<LocalGroup, "members">[] = [];
        const groupMembersList: LocalGroup["members"] = [];

        for (const group of groups.items) {
          const { members, ...groupValues } = group;

          groupsList.push(groupValues);
          groupMembersList.push(...members);
        }

        tx.insert(localGroup)
          .values(groupsList)
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

        if (groupMembersList.length > 0) {
          tx.delete(localGroupMember)
            .where(
              inArray(
                localGroupMember.groupId,
                groupsList.map((g) => g.id),
              ),
            )
            .run();

          tx.insert(localGroupMember).values(groupMembersList).onConflictDoNothing().run();
        }

        this.syncStateRepository.save("groups", groups.nextCursor, tx);
      }
    });
  }
}
