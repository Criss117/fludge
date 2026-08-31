import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";
import { statusEnum } from "./enums";

export const auditMetadata = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date()),
};

export const status = text("status", { enum: statusEnum })
  .notNull()
  .default("active");
