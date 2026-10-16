import type { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";
import type { TransactionService } from "@fludge/db";
import type { Result } from "@fludge/utils/trycatch";

import type { Organization } from "../entities/organization.entity";

export type Options = {
  tx?: TransactionService;
};

export interface OrganizationRepository extends TransactionalRepository {
  findById(organizationId: string): Promise<Result<Organization | null>>;

  save(organization: Organization, options?: Options): Promise<Result<void>>;
}
