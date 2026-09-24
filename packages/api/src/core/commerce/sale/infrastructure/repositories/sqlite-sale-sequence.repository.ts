import type { SaleSequenceRepository } from "@fludge/api/core/commerce/sale/domain/repositories/sale-sequence.repository";
import type { DatabaseService, TransactionService } from "@fludge/db";
import { saleSequences } from "@fludge/db/schema/sales.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { sql } from "drizzle-orm";

type Options = {
  tx?: TransactionService;
};

export class SQLiteSaleSequenceRepository implements SaleSequenceRepository {
  constructor(private readonly db: DatabaseService) {}

  public async getNextSequence(organizationId: string, options?: Options) {
    const db = options?.tx ?? this.db;

    const year = new Date().getFullYear();
    const [rows, error] = await tryCatch(
      db
        .insert(saleSequences)
        .values({
          organizationId,
          year,
          currentValue: 1,
        })
        .onConflictDoUpdate({
          target: [saleSequences.organizationId, saleSequences.year],
          set: {
            currentValue: sql`${saleSequences.currentValue} + 1`,
          },
        })
        .returning({
          value: saleSequences.currentValue,
        }),
    );

    if (error) return err(error);

    const next = rows.at(0);

    if (!next) return err(new Error("No se encontró la siguiente secuencia"));

    return ok(next.value);
  }
}
