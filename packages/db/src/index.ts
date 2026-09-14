import { env } from "@fludge/env/server";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import type { Client, ResultSet } from "@libsql/client";
import type { EmptyRelations } from "drizzle-orm";
import type { SQLiteAsyncTransaction } from "drizzle-orm/sqlite-core";
import { createResilientClient } from "./resilient-client";
import type { Logger } from "drizzle-orm/logger";

class QueryCounterLogger implements Logger {
  public count = 0;

  logQuery(query: string): void {
    if (!env.LOG_DB_QUERIES) return;

    this.count++;
    console.log(`[Consulta #${this.count}]`, query);
  }
}

export const queryLogger = new QueryCounterLogger();

export function createDb(config: { url: string; authToken?: string }) {
  const client = createResilientClient({
    url: config.url,
    authToken: config.authToken,
  });

  return drizzle({ client, logger: queryLogger });
}

export const databaseService = createDb({
  url: env.TURSO_URL,
  authToken: env.TURSO_TOKEN,
});

export type DatabaseService = LibSQLDatabase<EmptyRelations> & {
  $client: Client;
};

export type TransactionService = SQLiteAsyncTransaction<
  "async",
  ResultSet,
  EmptyRelations
>;
