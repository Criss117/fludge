import type { AuditMetadata } from "./audit-metadata";

export interface CategoryDetail extends AuditMetadata {
  id: string;
  name: string;
  description: string | null;
  parentId: CategoryDetail | null;
  subCategories: CategorySummary[];
}

export interface CategorySummary extends AuditMetadata {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
}
