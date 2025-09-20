import type { AuditMetadata } from "./audit-metadata";

export interface CategoryDetail extends AuditMetadata {
  id: string;
  name: string;
  description: string | null;
  parent: CategorySummary | null;
  subcategories: CategorySummary[];
}

export interface CategorySummary extends AuditMetadata {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
}
