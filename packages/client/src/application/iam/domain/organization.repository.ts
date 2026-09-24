import type { LocalOrganization } from "@fludge/db/local-schemas/shared.schema";

export interface OrganizationRepository {
  findAll(): Promise<LocalOrganization[]>;

  save(organization: LocalOrganization | LocalOrganization[]): Promise<void>;

  delete(organizationId: string | string[]): Promise<void>;
}
