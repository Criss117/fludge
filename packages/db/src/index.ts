import { env } from "@fludge/env/server";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import type { Client } from "@libsql/client";
import { type EmptyRelations, getColumns, type SQL, sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
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

export function buildConflictUpdateColumn<
  T extends SQLiteTable,
  Q extends keyof T["_"]["columns"],
>(table: T, columns: Q[]) {
  const cls = getColumns(table);

  return columns.reduce(
    (acc, column) => {
      const colName = cls[column]?.name;
      acc[column] = sql.raw(`excluded.${colName}`);

      return acc;
    },
    {} as Record<Q, SQL>,
  );
}

export function jsonObject<T extends SQLiteTable>(table: T) {
  const cls = getColumns(table);

  const chunks = Object.entries(cls).flatMap(([key, column], index) => {
    const pair = [sql.raw(`'${key}',`), sql`${column}`];
    return index === 0 ? pair : [sql.raw(","), ...pair];
  });

  return sql`json_object(${sql.join(chunks, sql``)})`;
}
