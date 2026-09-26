import type { DatabaseService } from "@fludge/db";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { tryCatch } from "@fludge/utils/trycatch";

const DEFAULT_CHUNK_SIZE = 200;

export async function batchInsert(
  db: DatabaseService,
  table: SQLiteTable,
  values: object[],
  chunkSize = DEFAULT_CHUNK_SIZE,
): Promise<void> {
  if (values.length === 0) return;

  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.slice(i, i + chunkSize);
    const [, err] = await tryCatch(db.insert(table).values(chunk as never));
    if (err)
      throw new Error(`Error inserting chunk ${i / chunkSize + 1}`, {
        cause: err,
      });
  }
}
