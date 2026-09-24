import { SalePayment } from "@fludge/api/core/commerce/sale/domain/entities/sale-payment.entity";
import type {
  Options,
  SalePaymentRepository,
} from "@fludge/api/core/commerce/sale/domain/repositories/sale-payment.repository";
import { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";
import type { DatabaseService } from "@fludge/db";
import { salePayment } from "@fludge/db/schema/sales.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, inArray } from "drizzle-orm";

export class SQLiteSalePaymentRepository
  extends TransactionalRepository
  implements SalePaymentRepository
{
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  public async findByCustomerPaymentId(
    organizationId: string,
    customerPaymentId: string,
  ) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select()
        .from(salePayment)
        .where(
          and(
            eq(salePayment.organizationId, organizationId),
            eq(salePayment.customerPaymentId, customerPaymentId),
          ),
        ),
    );

    if (errFind) return err(errFind);

    return ok(rows.map((r) => SalePayment.reconstitute(r)));
  }

  public async insertMany(salePayments: SalePayment[], options?: Options) {
    const db = options?.tx ?? this.db;

    const values = salePayments.map((sp) => sp.values);

    const [, errInsert] = await tryCatch(db.insert(salePayment).values(values));

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async deleteMany(salePaymentIds: string[], options?: Options) {
    const db = options?.tx ?? this.db;

    const [, errDelete] = await tryCatch(
      db.delete(salePayment).where(inArray(salePayment.id, salePaymentIds)),
    );

    if (errDelete) return err(errDelete);

    return ok(undefined);
  }

  public async deleteBySaleId(saleId: string, options?: Options) {
    const db = options?.tx ?? this.db;

    const [, errDelete] = await tryCatch(
      db.delete(salePayment).where(eq(salePayment.saleId, saleId)),
    );

    if (errDelete) return err(errDelete);

    return ok(undefined);
  }
}
