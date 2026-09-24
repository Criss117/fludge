import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { ProductPresentation } from "../entities/product-presentation.entity";

export type Options = {
  tx?: TransactionService;
};

export interface ProductPresentationRepository {
  save(
    presentations: ProductPresentation[],
    options?: Options,
  ): Promise<Result<void>>;
}
