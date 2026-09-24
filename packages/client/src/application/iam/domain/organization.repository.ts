import type { LocalOrganization } from "@fludge/db/local-schemas/shared.schema";

export type OrganizationSummary = LocalOrganization;

export interface OrganizationRepository {
  findAll(): Promise<OrganizationSummary[]>;

  save(
    organization: OrganizationSummary | OrganizationSummary[],
  ): Promise<void>;

  delete(organizationId: string | string[]): Promise<void>;
}
