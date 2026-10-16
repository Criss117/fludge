import type { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";
import type { TransactionService } from "@fludge/db";
import type { Result } from "@fludge/utils/trycatch";

import type { Product } from "../entities/product.entity";

export type Options = {
  tx?: TransactionService;
};

export interface ProductRepository extends TransactionalRepository {
  findById(organizationId: string, productId: string): Promise<Result<Product | null>>;

  findManyByIds(organizationId: string, productIds: string[]): Promise<Result<Product[]>>;

  save(product: Product | Product[]): Promise<Result<void>>;

  saveOnlyProduct(products: Product | Product[], options?: Options): Promise<Result<void>>;
}
