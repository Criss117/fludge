import type {
  LocalOrganization,
  LocalMember,
  LocalGroup,
} from "@fludge/db/local-schemas/shared.schema";

/** Timestamps más recientes del cliente por entidad. */
export type IamLastSyncedAt = {
  organization: Date | null;
  member: Date | null;
  group: Date | null;
};

/** Resultado del sync de IAM — entidades agrupadas como el aggregate root. */
export type IamSyncResult = {
  organizations: LocalOrganization[];
  members: LocalMember[];
  groups: LocalGroup[];
};
