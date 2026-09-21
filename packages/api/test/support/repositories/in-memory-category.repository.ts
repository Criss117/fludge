import { ok, type Result } from "@fludge/utils/trycatch";
import { Category } from "@fludge/api/modules/catalog/categories/domain/entities/category.entity";
import type { CategoryRepository } from "@fludge/api/modules/catalog/categories/domain/repositories/category.repository";

/**
 * Test double de CategoryRepository.
 * Guarda las categorías en un Map en memoria keyed por `${organizationId}:${categoryId}`.
 */
export class InMemoryCategoryRepository implements CategoryRepository {
  private readonly store = new Map<string, Category>();

  private key(organizationId: string, categoryId: string): string {
    return `${organizationId}:${categoryId}`;
  }

  public getAll(organizationId?: string): Category[] {
    const categories = Array.from(this.store.values());

    return organizationId
      ? categories.filter((c) =>
          this.store.has(this.key(organizationId, c.id.toString())),
        )
      : categories;
  }

  public clear(): void {
    this.store.clear();
  }

  public async findOneById(
    organizationId: string,
    categoryId: string,
  ): Promise<Result<Category | null>> {
    const category = this.store.get(this.key(organizationId, categoryId));

    return category ? ok(category) : ok(null);
  }

  public async save(category: Category): Promise<Result<unknown, Error>> {
    const organizationId = category.values.organizationId;

    this.store.set(this.key(organizationId, category.id.toString()), category);

    return ok(undefined);
  }
}