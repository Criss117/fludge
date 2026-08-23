// audit-metadata.ts
import { sql } from "drizzle-orm";
import { integer } from "drizzle-orm/sqlite-core";

export const auditMetadata = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
};
