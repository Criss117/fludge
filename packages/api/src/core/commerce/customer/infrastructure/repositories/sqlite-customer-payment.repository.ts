import { CustomerPayment } from "../../../../commerce/customer/domain/entities/customer-payment.entity";
import type {
  Options,
  CustomerPaymentRepository,
} from "../../../../commerce/customer/domain/repositories/customer-payment.repository";
import { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";
import type { DatabaseService } from "@fludge/db";
import { customerPayment } from "@fludge/db/schema/customer.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { eq } from "drizzle-orm";

export class SQLiteCustomerPaymentRepository
  extends TransactionalRepository
  implements CustomerPaymentRepository
{
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  public async insert(paymentEntity: CustomerPayment, options?: Options) {
    const db = options?.tx ?? this.db;

    const values = paymentEntity.values;

    const [, errInsert] = await tryCatch(
      db.insert(customerPayment).values({
        id: values.id,
        customerId: values.customerId,
        amount: values.amount,
        method: values.method,
        notes: values.notes,
        organizationId: values.organizationId,
        createdBy: values.createdBy,
        createdAt: values.createdAt,
        updatedAt: values.updatedAt,
      }),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async delete(customerPaymentId: string, options?: Options) {
    const db = options?.tx ?? this.db;

    const [, errDelete] = await tryCatch(
      db
        .delete(customerPayment)
        .where(eq(customerPayment.id, customerPaymentId)),
    );

    if (errDelete) return err(errDelete);

    return ok(undefined);
  }
}
