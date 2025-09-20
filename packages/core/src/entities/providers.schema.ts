import type { AuditMetadata } from "./audit-metadata";

export interface ProvidersDetail extends AuditMetadata {
  id: string;
  name: string;
  nit: string;
  email: string | null;
  phone: string;
  principalContact: string | null;
}

export interface ProvidersSummary {
  id: string;
  name: string;
  nit: string;
  email: string | null;
  phone: string;
  principalContact: string | null;
  createdAt: Date;
}
