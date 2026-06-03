import type { DbConnection, TXConnection } from "@fludge/db";

export type TransactionalOptions = {
  tx?: TXConnection;
};

export class TransactionalRepository {
  constructor(private readonly connection: DbConnection) {}

  public async transaction<T>(fn: (tx: TXConnection) => Promise<T>) {
    const tx = this.connection.transaction((tx) => fn(tx));

    return tx;
  }
}
