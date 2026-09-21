import type { Result } from "@fludge/utils/trycatch";
import type { Organization } from "../entities/organization.entity";
import type { TransactionService } from "@fludge/db";

export interface OrganizationRepository {
  findOneById(
    loggedUserId: string,
    organizationId: string,
  ): Promise<Result<Organization | null, Error>>;

  saveOnlyOrganization(
    data: Organization,
    options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>>;

  save(data: Organization): Promise<Result<undefined, Error>>;
}
