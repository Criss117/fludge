import type { Permission } from "../value-objects/permission.vo";
import type { AuditMetadata } from "./audit-metadata";
import type { UserSummary } from "./user.entity";

export interface GroupSummary {
  id: string;
  name: string;
  description?: string | null;
  permissions: Permission[];
  createdAt: Date;
}

export interface GroupDetail extends AuditMetadata {
  id: string;
  name: string;
  description?: string | null;
  permissions: Permission[];
  users: UserSummary[];
}
