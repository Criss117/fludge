import type {
  LocalUser,
  LocalOrganization,
  LocalMember,
  LocalGroup,
} from "@fludge/db/local-schemas/shared.schema";

/** Timestamps más recientes del cliente por entidad. */
export type IamLastSyncedAt = {
  user: Date | null;
  organization: Date | null;
  member: Date | null;
  group: Date | null;
};

/** Resultado del sync de IAM — entidades agrupadas como el aggregate root. */
export type IamSyncResult = {
  users: LocalUser[];
  organizations: LocalOrganization[];
  members: LocalMember[];
  groups: LocalGroup[];
};
