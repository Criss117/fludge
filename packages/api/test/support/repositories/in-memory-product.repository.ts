import { ok, type Result } from "@fludge/utils/trycatch";
import { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/domain/repositories/product.repository";
import type { TransactionService } from "@fludge/db";

/**
 * Test double de ProductRepository.
 * Guarda los productos en un Map en memoria keyed por `${organizationId}:${productId}`.
 */
export class InMemoryProductRepository implements ProductRepository {
  private readonly store = new Map<string, Product>();

  private key(organizationId: string, productId: string): string {
    return `${organizationId}:${productId}`;
  }

  public getAll(organizationId?: string): Product[] {
    const products = Array.from(this.store.values());

    return organizationId
      ? products.filter((p) =>
          this.store.has(this.key(organizationId, p.id.toString())),
        )
      : products;
  }

  public clear(): void {
    this.store.clear();
  }

  public async findOneById(
    organizationId: string,
    productId: string,
  ): Promise<Result<Product | null, Error>> {
    const product = this.store.get(this.key(organizationId, productId));

    return product ? ok(product) : ok(null);
  }

  public async findManyByIds(
    organizationId: string,
    productIds: string[],
  ): Promise<Result<Product[], Error>> {
    const products = productIds
      .map((id) => this.store.get(this.key(organizationId, id)))
      .filter((p) => p !== undefined) as Product[];

    return ok(products);
  }

  public async save(productEntity: Product): Promise<Result<unknown, Error>> {
    this.store.set(
      this.key(productEntity.values.organizationId, productEntity.id.toString()),
      productEntity,
    );

    return ok(undefined);
  }

  public async saveOnlyProduct(
    productEntity: Product,
    _options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>> {
    return this.save(productEntity);
  }

  public async saveOnlyProducts(
    productEntities: Product[],
    _options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>> {
    for (const product of productEntities) {
      await this.save(product);
    }

    return ok(undefined);
  }

  public async delete(
    organizationId: string,
    productId: string,
  ): Promise<Result<unknown, Error>> {
    this.store.delete(this.key(organizationId, productId));

    return ok(undefined);
  }
}