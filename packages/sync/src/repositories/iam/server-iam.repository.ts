import type {
  LocalGroup,
  LocalMember,
  LocalOrganization,
  LocalUser,
} from "@fludge/sync/entities/iam.entities";
import type { IamLastSyncedAt } from "./client-iam.repository";

type AllIamItems = {
  users: LocalUser[];
  groups: LocalGroup[];
  members: LocalMember[];
  organizations: LocalOrganization[];
};

export interface ServerSyncIamRepository {
  findAllItems: (
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAt,
  ) => Promise<AllIamItems>;
}
