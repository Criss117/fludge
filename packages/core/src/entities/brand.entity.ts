import type { AuditMetadata } from "./audit-metadata";

export interface BrandDetail extends AuditMetadata {
  id: string;
  name: string;
  description: string | null;
}

export interface BrandSummary {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}
