import { pgEnum } from "drizzle-orm/pg-core";

export const permissionsEnum = pgEnum("permissions", [
  "sale:create",
  "sale:cancel",
  "sale:refund",
  "sale:view",

  "product:create",
  "product:edit",
  "product:view",
  "product:movement:create",

  "customer:create",
  "customer:edit",
  "customer:view",

  "credit:view",
  "credit:payment:create",
  "credit:adjustment:create",

  "employee:create",
  "employee:edit",
  "employee:view",

  "group:create",
  "group:edit",
  "group:view",
  "group:assign",

  "register:open",
  "register:close",
  "register:adjustment",

  "report:view",
  "report:export",

  "settings:view",
  "settings:edit",
]);

export const statusEnum = pgEnum("status", ["active", "inactive"]);
