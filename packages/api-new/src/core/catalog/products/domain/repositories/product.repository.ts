import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Product } from "../entities/product.entity";
import type { TransactionalRepository } from "@core/shared/repositories/transactional-repository";

export type Options = {
  tx?: TransactionService;
};

export interface ProductRepository extends TransactionalRepository {
  findById(
    organizationId: string,
    productId: string,
  ): Promise<Result<Product | null>>;

  findManyByIds(
    organizationId: string,
    productIds: string[],
  ): Promise<Result<Product[]>>;

  insert(product: Product, options?: Options): Promise<Result<void>>;

  update(product: Product, options?: Options): Promise<Result<void>>;

  updateMany(products: Product[], options?: Options): Promise<Result<void>>;
}