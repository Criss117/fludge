import { ok, tryCatch, type Result } from "@fludge/utils/trycatch";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import type { GroupRepository } from "@fludge/api/modules/iam/organization/domain/repositories/group.repository";
import type { TransactionService } from "@fludge/db";
import { DummyTransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";

/**
 * Test double de GroupRepository.
 * Guarda los grupos en un Map en memoria keyed por `${organizationId}:${groupId}`.
 */
export class InMemoryGroupRepository
  extends DummyTransactionalRepository
  implements GroupRepository
{
  private readonly store = new Map<string, Group>();

  private key(organizationId: string, groupId: string): string {
    return `${organizationId}:${groupId}`;
  }

  public getAll(organizationId?: string): Group[] {
    const groups = Array.from(this.store.values());

    return organizationId
      ? groups.filter((g) =>
          this.store.has(this.key(organizationId, g.id.toString())),
        )
      : groups;
  }

  public clear(): void {
    this.store.clear();
  }

  public async save(
    organizationId: string,
    groupValues: Group | Group[],
    _options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>> {
    const groups = Array.isArray(groupValues) ? groupValues : [groupValues];

    for (const group of groups) {
      this.store.set(this.key(organizationId, group.id.toString()), group);
    }

    return ok(undefined);
  }

  public async delete(
    organizationId: string,
    groupValues: Group | Group[],
    _options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>> {
    const groups = Array.isArray(groupValues) ? groupValues : [groupValues];

    for (const group of groups) {
      this.store.delete(this.key(organizationId, group.id.toString()));
    }

    return ok(undefined);
  }

  public async transaction<T>(
    fn: (tx: TransactionService) => Promise<T>,
  ): Promise<Result<T, Error>> {
    // Los repos in-memory ignoran el tx; solo ejecutamos el callback.
    const tx = {} as TransactionService;

    return tryCatch(fn(tx));
  }
}