import { pgEnum } from "drizzle-orm/pg-core";
import { ALL_PERMISSIONS } from "@fludge/utils/permissions/index";

export const permissionEnum = pgEnum("permission", ALL_PERMISSIONS);

export const statusEnum = pgEnum("status", ["active", "inactive"]);

export const actionEnum = pgEnum("action", [
  "update",
  "activate",
  "deactivate",
]);
