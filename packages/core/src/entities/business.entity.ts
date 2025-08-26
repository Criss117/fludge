import type { AuditMetadata } from "./audit-metadata";
import type { GroupEntity } from "./group.entity";

export interface BusinessEntity extends AuditMetadata {
  id: string;
  name: string;
  nit: string;
  address: string;
  city: string;
  state?: string | null;
  rootUserId: string;
  groups: GroupEntity[];
}
