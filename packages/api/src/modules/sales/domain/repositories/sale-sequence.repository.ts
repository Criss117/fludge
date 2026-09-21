import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";

export interface SaleSequenceRepository {
  getNextSequence(
    organizationId: string,
    options?: { tx?: TransactionService },
  ): Promise<Result<number, Error>>;
}
