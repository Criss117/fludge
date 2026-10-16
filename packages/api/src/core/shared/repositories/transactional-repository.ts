import type { DatabaseService, TransactionService } from "@fludge/db";
import { type Result, tryCatch } from "@fludge/utils/trycatch";

export type TransactionalOptions = {
  tx?: TransactionService;
};

export interface ITransactionalRepository {
  transaction<T>(fn: (tx: TransactionService) => Promise<T>): Promise<Result<T, Error>>;
}

export class TransactionalRepository implements ITransactionalRepository {
  constructor(private readonly connection: DatabaseService) {}

  public async transaction<T>(fn: (tx: TransactionService) => Promise<T>) {
    return tryCatch(this.connection.transaction((tx) => fn(tx)));
  }
}

export class DummyTransactionalRepository implements ITransactionalRepository {
  public async transaction<T>(fn: (tx: TransactionService) => Promise<T>) {
    return tryCatch(fn({} as TransactionService));
  }
}
