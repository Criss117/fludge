import { int } from "drizzle-orm/sqlite-core";

export const auditMetadata = {
  createdAt: int("created_at", {
    mode: "timestamp",
  }).$defaultFn(() => new Date()),
  updatedAt: int("updated_at", {
    mode: "timestamp",
  }).$defaultFn(() => new Date()),
  deletedAt: int("deleted_at", {
    mode: "timestamp",
  }),
  isActive: int("is_active", {
    mode: "boolean",
  }).default(true),
};
