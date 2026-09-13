import type {
  HttpClientIamRepository,
  IamLastSyncedAt,
  LocalClientIamRepository,
} from "@fludge/sync/repositories/iam/client-iam.repository";

export class SyncClientIamEngine {
  constructor(
    private readonly localClientIamRepository: LocalClientIamRepository,
    private readonly httpClientIamRepository: HttpClientIamRepository,
  ) {}

  public async getLastSyncedAt(): Promise<IamLastSyncedAt> {
    const { group, member, organization, user } =
      await this.localClientIamRepository.getLastSyncedAt();

    return {
      user: user?.updatedAt ?? null,
      group: group?.updatedAt ?? null,
      member: member?.createdAt ?? null,
      organization: organization?.updatedAt ?? null,
    };
  }

  public async sync(lastSyncedAt: IamLastSyncedAt) {
    const { users, groups, members, organizations } =
      await this.httpClientIamRepository.findLastSyncedAt(lastSyncedAt);

    await this.localClientIamRepository.saveAll({
      users,
      groups,
      members,
      organizations,
    });
  }
}
