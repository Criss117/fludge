import { AuditMetadata } from "./audit-metadata";

export interface GroupSummary {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
}

export interface GroupDetail extends AuditMetadata {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}
