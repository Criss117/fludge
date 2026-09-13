import { productStatusEnum, statusEnum } from "@fludge/utils/enums/db-enums";
import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

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

export const productStatus = text("status", { enum: productStatusEnum })
  .notNull()
  .default("active");
