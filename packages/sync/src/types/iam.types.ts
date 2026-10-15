import type {
  LocalOrganization,
  LocalMember,
  LocalGroup,
} from "@fludge/db/local-schemas/shared.schema";
import type { SyncCursor, SyncPage } from "./shared.types";

/** Timestamps más recientes del cliente por entidad. */
export type IamSyncCursors = {
  organization: SyncCursor | null; // null = nunca sincronizó, pide todo
  member: SyncCursor | null;
  group: SyncCursor | null;
};

/** Resultado del sync de IAM — entidades agrupadas como el aggregate root. */
export type IamSyncResult = {
  organizations: SyncPage<LocalOrganization>;
  members: SyncPage<LocalMember>;
  groups: SyncPage<LocalGroup>;
};
