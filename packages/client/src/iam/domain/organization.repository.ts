import type { LocalOrganization } from "@fludge/db/local-schemas/shared.schema";

import type { OrganizationSummary } from "./entities";

export interface OrganizationRepository {
  findAll(): Promise<OrganizationSummary[]>;

  findOneById(organizationId: string): Promise<OrganizationSummary | null>;

  save(organization: LocalOrganization | LocalOrganization[]): Promise<void>;

  delete(organizationId: string | string[]): Promise<void>;

  clearAll(): Promise<void>;
}
