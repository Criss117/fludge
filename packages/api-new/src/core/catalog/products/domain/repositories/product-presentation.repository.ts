import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { ProductPresentation } from "../entities/product-presentation.entity";

export type Options = {
  tx?: TransactionService;
};

export interface ProductPresentationRepository {
  save(
    productId: string,
    presentations: readonly ProductPresentation[],
    options?: Options,
  ): Promise<Result<void>>;

  deleteMany(
    organizationId: string,
    productId: string,
    presentationIds: string[],
    options?: Options,
  ): Promise<Result<void>>;
}