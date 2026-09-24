import type { Result } from "@fludge/utils/trycatch";
import type { Organization } from "../entities/organization.entity";
import type { TransactionService } from "@fludge/db";
import type { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";

export type Options = {
  tx?: TransactionService;
};

export interface OrganizationRepository extends TransactionalRepository {
  findById(organizationId: string): Promise<Result<Organization | null>>;

  save(organization: Organization, options?: Options): Promise<Result<void>>;
}
