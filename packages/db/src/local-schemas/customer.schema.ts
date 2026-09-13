import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/sqlite-core";
import { createdByMetadata, organizationMetadata } from "./iam.schema";

import {
  customerDocumentTypeEnum,
  statusEnum,
} from "@fludge/utils/enums/db-enums";
import { auditMetadata } from "../shared";

export const customer = sqliteTable(
  "customer",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),

    creditLimit: integer("credit_limit"),
    balance: integer("balance").notNull().default(0),

    documentType: text("document_type", { enum: customerDocumentTypeEnum }),
    documentNumber: text("document_number"),

    status: text("status", { enum: statusEnum }).notNull(),

    ...organizationMetadata,
    ...auditMetadata,
    ...createdByMetadata,
  },
  (t) => [
    // Un mismo documento no se puede repetir dentro de la misma organización.
    // Las filas con document_number NULL no colisionan entre sí (comportamiento
    // estándar de SQLite: NULL nunca es igual a NULL en un índice único).
    uniqueIndex("customer_org_document_unique").on(
      t.organizationId,
      t.documentNumber,
    ),

    // Listado de clientes activos por organización (pantalla principal del módulo)
    index("customer_org_status_idx").on(t.organizationId, t.status),

    // Búsqueda/autocompletado de clientes por nombre dentro de una organización
    index("customer_org_name_idx").on(t.organizationId, t.name),

    // --- checks de longitud ---
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
      sql`${t.documentNumber} IS NULL OR length(${t.documentNumber}) BETWEEN 5 AND 30`,
    ),

    // --- checks de negocio ---
    // El límite de crédito, si existe, no puede ser negativo
    check(
      "customer_credit_limit_non_negative_check",
      sql`${t.creditLimit} IS NULL OR ${t.creditLimit} >= 0`,
    ),
    // documentType y documentNumber van siempre juntos: ambos null o ambos con valor
    check(
      "customer_document_pair_check",
      sql`(${t.documentType} IS NULL AND ${t.documentNumber} IS NULL)
          OR (${t.documentType} IS NOT NULL AND ${t.documentNumber} IS NOT NULL)`,
    ),
    // Debe existir al menos un medio de contacto
    check(
      "customer_contact_required_check",
      sql`${t.phone} IS NOT NULL OR ${t.email} IS NOT NULL`,
    ),
  ],
);

export type CustomerSelect = typeof customer.$inferSelect;
export type CustomerInsert = typeof customer.$inferInsert;
