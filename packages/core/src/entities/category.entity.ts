import type { AuditMetadata } from "./audit-metadata";

export interface CategoryDetail extends AuditMetadata {
  id: string;
  name: string;
  description: string | null;
  parent: CategorySummary | null;
  businessId: string;
  subcategories: CategorySummary[];
}

export interface CategorySummary extends AuditMetadata {
  id: string;
  name: string;
  description: string | null;
  businessId: string;
  parentId: string | null;
}
