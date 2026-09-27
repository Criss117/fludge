import { ok } from "@fludge/utils/trycatch";
import type { Result } from "@fludge/utils/trycatch";
import type { Group } from "@fludge/api/core/iam/domain/entities/group.entity";
import type { GroupRepository, Options } from "@fludge/api/core/iam/domain/repositories/group.repository";
import { DummyTransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";

export class InMemoryGroupRepository
  extends DummyTransactionalRepository
  implements GroupRepository
{
  private groups: Map<string, Group> = new Map();

  public get size() {
    return this.groups.size;
  }

  async findById(_organizationId: string, groupId: string): Promise<Result<Group | null>> {
    return ok(this.groups.get(groupId) ?? null);
  }

  async findByIds(_organizationId: string, groupIds: string[]): Promise<Result<Group[]>> {
    const found = groupIds
      .map((id) => this.groups.get(id))
      .filter((group): group is Group => group !== undefined);
    return ok(found);
  }

  async saveOnlyGroup(groups: Group | Group[], _options?: Options): Promise<Result<void>> {
    const items = Array.isArray(groups) ? groups : [groups];
    for (const g of items) {
      this.groups.set(g.id.toString(), g);
    }
    return ok(undefined);
  }

  async save(group: Group | Group[]): Promise<Result<void>> {
    const items = Array.isArray(group) ? group : [group];
    for (const g of items) {
      this.groups.set(g.id.toString(), g);
    }
    return ok(undefined);
  }

  async delete(groups: Group | Group[]): Promise<Result<void>> {
    const items = Array.isArray(groups) ? groups : [groups];
    for (const g of items) {
      this.groups.delete(g.id.toString());
    }
    return ok(undefined);
  }

  clear() {
    this.groups.clear();
  }
}