import type { AuditMetadata } from "./audit-metadata";
import type { GroupSummary } from "./group.entity";
import type { UserSummary } from "./user.entity";

export interface BusinessDetail extends AuditMetadata {
  id: string;
  name: string;
  nit: string;
  address: string;
  city: string;
  state?: string | null;
  rootUserId: string;
  groups: GroupSummary[];
  employees: UserSummary[];
}

export interface BusinessSummary {
  id: string;
  name: string;
  nit: string;
  createdAt: Date;
}
