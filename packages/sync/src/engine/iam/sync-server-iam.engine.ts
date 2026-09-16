import type {
  IamLastSyncedAt,
  ServerSyncIamRepository,
} from "@fludge/sync/repositories/iam/server-sync-iam.repository";

export class SyncServerIamEngine {
  constructor(
    private readonly serverSyncIamRepository: ServerSyncIamRepository,
  ) {}

  public async getLastSyncedAt(
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAt,
  ) {
    const { users, groups, members, organizations, groupMembers } =
      await this.serverSyncIamRepository.findAllItems(
        organizationIds,
        lastSyncedAt,
      );

    return {
      users,
      groups,
      members,
      organizations,
      groupMembers,
    };
  }
}
