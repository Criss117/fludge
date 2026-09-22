import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Product } from "../entities/product.entity";
import type { ITransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";

export interface ProductRepository extends ITransactionalRepository {
  findOneById(
    organizationId: string,
    productId: string,
  ): Promise<Result<Product | null, Error>>;

  findManyByIds(
    organizationId: string,
    productIds: string[],
  ): Promise<Result<Product[], Error>>;

  save(productEntity: Product): Promise<Result<unknown, Error>>;

  saveOnlyProduct(
    productEntity: Product,
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;

  saveOnlyProducts(
    productEntity: Product[],
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;

  delete(
    organizationId: string,
    productId: string,
  ): Promise<Result<unknown, Error>>;
}
