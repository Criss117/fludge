import { env } from "@fludge/env/server";
import { drizzle, type NodePgQueryResultHKT } from "drizzle-orm/node-postgres";

import * as schema from "./schemas";
import type { PgTable, PgTransaction } from "drizzle-orm/pg-core";
import {
  getTableColumns,
  SQL,
  sql,
  type ExtractTablesWithRelations,
} from "drizzle-orm";

export function createDb() {
  return drizzle(env.DATABASE_URL, { schema });
}

export const dbConnection = createDb();

export type DbConnection = Awaited<ReturnType<typeof createDb>>;

export type TXConnection = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export const buildConflictUpdateColumns = <
  T extends PgTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);

  return columns.reduce(
    (acc, column) => {
      const colName = cls[column]?.name;
      acc[column] = sql.raw(`excluded.${colName}`);

      return acc;
    },
    {} as Record<Q, SQL>,
  );
};
