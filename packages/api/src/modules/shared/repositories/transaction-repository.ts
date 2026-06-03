import type { DbConnection, TXConnection } from "@fludge/db";

export class TransactionRepository {
  constructor(private readonly connection: DbConnection) {}

  public async transaction<T>(fn: (tx: TXConnection) => Promise<T>) {
    const tx = this.connection.transaction((tx) => fn(tx));

    return tx;
  }
}
