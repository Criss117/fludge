import { Permission } from "../value-objects/permission.vo";
import { AuditMetadata } from "./audit-metadata";

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
  description: string;
  permissions: Permission[];
}
