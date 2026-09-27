import { ok } from "@fludge/utils/trycatch";
import type { Result } from "@fludge/utils/trycatch";
import type { Organization } from "@fludge/api/core/iam/domain/entities/organization.entity";
import type { Options, OrganizationRepository } from "@fludge/api/core/iam/domain/repositories/organization.repository";
import { DummyTransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";

export class InMemoryOrganizationRepository
  extends DummyTransactionalRepository
  implements OrganizationRepository
{
  private organizations: Map<string, Organization> = new Map();

  public get size() {
    return this.organizations.size;
  }

  async findById(organizationId: string): Promise<Result<Organization | null>> {
    return ok(this.organizations.get(organizationId) ?? null);
  }

  async save(organization: Organization, _options?: Options): Promise<Result<void>> {
    this.organizations.set(organization.id.toString(), organization);
    return ok(undefined);
  }

  clear() {
    this.organizations.clear();
  }
}