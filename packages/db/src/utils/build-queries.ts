import { asc, desc, getColumns, SQL, sql } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";

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

export function sortBy<T extends SQLiteColumn>(
  column: T,
  direction: "asc" | "desc",
) {
  return direction === "asc" ? asc(column) : desc(column);
}
