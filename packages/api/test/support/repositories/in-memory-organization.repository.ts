import { ok, type Result } from "@fludge/utils/trycatch";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { OrganizationRepository } from "@fludge/api/modules/iam/organization/domain/repositories/organization.repository";
import type { TransactionService } from "@fludge/db";

/**
 * Test double de OrganizationRepository.
 * Guarda las entidades en un Map en memoria y permite inspeccionarlas.
 */
export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly store = new Map<string, Organization>();

  /** Retorna todas las organizaciones guardadas (para asserts). */
  public getAll(): Organization[] {
    return Array.from(this.store.values());
  }

  public clear(): void {
    this.store.clear();
  }

  public async findOneById(
    loggedUserId: string,
    organizationId: string,
  ): Promise<Result<Organization | null, Error>> {
    const org = this.store.get(organizationId);

    if (!org) return ok(null);

    const isMember = org.members.all.some((m) => m.userId.toString() === loggedUserId);

    return ok(isMember ? org : null);
  }

  public async saveOnlyOrganization(
    data: Organization,
    _options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>> {
    this.store.set(data.id.toString(), data);

    return ok(undefined);
  }

  public async save(data: Organization): Promise<Result<undefined, Error>> {
    this.store.set(data.id.toString(), data);

    return ok(undefined);
  }

  public async findByOrganizationId(
    organizationId: string,
  ): Promise<Result<Organization | null, Error>> {
    const org = this.store.get(organizationId);

    return org ? ok(org) : ok(null);
  }
}