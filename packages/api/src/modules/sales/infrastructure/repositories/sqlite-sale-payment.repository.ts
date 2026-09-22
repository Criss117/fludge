import type { SalePaymentRepository } from "@fludge/api/modules/sales/domain/repositories/sale-payment.repository";
import type { DatabaseService, TransactionService } from "@fludge/db";
import { err, ok, tryCatch, type Result } from "@fludge/utils/trycatch";
import { salePayment } from "@fludge/db/schema/sales.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { SalePayment } from "@fludge/api/modules/sales/domain/entities/sale-payments.entity";

type Options = {
  tx?: TransactionService;
};

export class SQLiteSalePaymentRepository implements SalePaymentRepository {
  constructor(private readonly db: DatabaseService) {}

  public async save(
    payments: SalePayment | SalePayment[],
    options?: Options,
  ): Promise<Result<void, Error>> {
    const values = Array.isArray(payments)
      ? payments.map((p) => p.values)
      : [payments.values];

    const db = options?.tx ?? this.db;

    const [, errSave] = await tryCatch(
      db
        .insert(salePayment)
        .values(values)
        .onConflictDoUpdate({
          target: salePayment.id,
          set: buildConflictUpdateColumn(salePayment, ["status", "updatedAt"]),
        }),
    );

    if (errSave) return err(errSave);

    return ok(undefined);
  }
}
