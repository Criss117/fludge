import type {
  ClientSyncIamRepository,
  HttpClientSyncIamRepository,
} from "@fludge/sync/repositories/iam/client-sync-iam.repository";
import type { IamLastSyncedAt } from "@fludge/sync/repositories/iam/server-sync-iam.repository";

export class SyncClientIamEngine {
  constructor(
    private readonly clientSyncIamRepository: ClientSyncIamRepository,
    private readonly httpClientSyncIamRepository: HttpClientSyncIamRepository,
  ) {}

  public async getLastSyncedAt(): Promise<IamLastSyncedAt> {
    const { group, member, organization, user, groupMember } =
      await this.clientSyncIamRepository.getLastSyncedAt();

    return {
      user: user?.updatedAt ?? null,
      group: group?.updatedAt ?? null,
      member: member?.createdAt ?? null,
      organization: organization?.updatedAt ?? null,
      groupMember: groupMember?.createdAt ?? null,
    };
  }

  public async sync(lastSyncedAt: IamLastSyncedAt) {
    const { users, groups, members, organizations, groupMembers } =
      await this.httpClientSyncIamRepository.findLastSyncedAt(lastSyncedAt);

    await this.clientSyncIamRepository.saveAll({
      users,
      groups,
      members,
      organizations,
      groupMembers,
    });
  }
}
