import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/sqlite-core";

import { customerDocumentTypeEnum } from "@fludge/utils/enums/db-enums";
import { auditMetadata } from "../shared";
import { memberId, organizationId } from "./iam.schema";

export const customer = sqliteTable(
  "customer",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),

    creditLimit: integer("credit_limit").notNull(),
    balance: integer("balance").notNull().default(0),

    documentType: text("document_type", { enum: customerDocumentTypeEnum })
      .notNull()
      .default("CC"),
    documentNumber: text("document_number").notNull(),

    organizationId: organizationId(),
    createdBy: memberId(),
    ...auditMetadata,
  },
  (t) => [
    uniqueIndex("customer_org_document_unique").on(
      t.organizationId,
      t.documentNumber,
    ),

    index("customer_org_status_idx").on(t.organizationId, t.status),

    index("customer_org_name_idx").on(t.organizationId, t.name),

    check(
      "customer_name_length_check",
      sql`length(${t.name}) BETWEEN 2 AND 120`,
    ),
    check(
      "customer_phone_length_check",
      sql`${t.phone} IS NULL OR length(${t.phone}) BETWEEN 7 AND 20`,
    ),
    check(
      "customer_email_length_check",
      sql`${t.email} IS NULL OR length(${t.email}) BETWEEN 5 AND 160`,
    ),
    check(
      "customer_document_number_length_check",
      sql`length(${t.documentNumber}) BETWEEN 5 AND 30`,
    ),

    check(
      "customer_credit_limit_non_negative_check",
      sql`${t.creditLimit} >= 0`,
    ),
  ],
);

export type CustomerSelect = typeof customer.$inferSelect;
export type CustomerInsert = typeof customer.$inferInsert;
