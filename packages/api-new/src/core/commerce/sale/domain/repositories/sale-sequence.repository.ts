import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";

export type Options = {
  tx?: TransactionService;
};

export interface SaleSequenceRepository {
  getNextSequence(
    organizationId: string,
    options?: Options,
  ): Promise<Result<number>>;
}
