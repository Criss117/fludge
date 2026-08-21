import { env } from "@fludge/env/server";
import type { Connection } from "@tursodatabase/serverless";
import { type EmptyRelations, getColumns, type SQL, sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import {
  drizzle,
  type TursoDatabaseServerlessDatabase,
} from "drizzle-orm/tursodatabase-serverless";

export const databaseService = drizzle({
  connection: {
    url: env.TURSO_URL,
    authToken: env.TURSO_TOKEN,
  },
});

export type DatabaseService =
  TursoDatabaseServerlessDatabase<EmptyRelations> & {
    $client: Connection;
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
