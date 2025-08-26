import { AuditMetadata } from "./audit-metadata";

export interface GroupEntity extends AuditMetadata {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}
