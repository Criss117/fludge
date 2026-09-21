import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { ProductPresentation } from "../entities/product-presentation.entity";

export interface ProductPresentationRepository {
  save(
    productId: string,
    presentations: readonly ProductPresentation[],
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;

  deleteMany(
    organizationId: string,
    productId: string,
    presentationIds: string[],
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;

  deleteAll(
    organizationId: string,
    productId: string,
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;
}
