import type { LocalOrganization } from "@fludge/db/local-schemas/shared.schema";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Result } from "@fludge/utils/trycatch";

import type { OrganizationSummary } from "./entities";

export interface OrganizationRepository {
  findAll(): Promise<Result<OrganizationSummary[], RepositoryError>>;

  findOneById(organizationId: string): Promise<Result<OrganizationSummary | null, RepositoryError>>;

  save(
    organization: LocalOrganization | LocalOrganization[],
  ): Promise<Result<void, RepositoryError>>;

  delete(organizationId: string | string[]): Promise<Result<void, RepositoryError>>;

  clearAll(): Promise<Result<void, RepositoryError>>;
}
