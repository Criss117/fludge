import type { DatabaseService, TransactionService } from "@fludge/db";
import { tryCatch } from "@fludge/utils/trycatch";

export type TransactionalOptions = {
  tx?: TransactionService;
};

export class TransactionalRepository {
  constructor(private readonly connection: DatabaseService) {}

  public async transaction<T>(fn: (tx: TransactionService) => Promise<T>) {
    return tryCatch(this.connection.transaction((tx) => fn(tx)));
  }
}
