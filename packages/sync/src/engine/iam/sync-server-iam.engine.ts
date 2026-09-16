import type { ServerSyncIamRepository } from "../../repositories/iam/server-sync-iam.repository";
import type { IamLastSyncedAt } from "../../repositories/iam/client-sync-iam.repository";

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
