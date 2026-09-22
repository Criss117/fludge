import { TransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";
import type { DatabaseService, TransactionService } from "@fludge/db";

import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq } from "drizzle-orm";
import { CustomerPayment } from "@fludge/api/modules/customer/domain/entities/customer-payment.entity";
import type { CustomerPaymentRepository } from "@fludge/api/modules/customer/domain/repositories/customer-payment.repository";
import { customerPayment } from "@fludge/db/schema/customer.schema";

type Options = {
  tx?: TransactionService;
};

export class SQLiteCustomerPaymentRepository
  extends TransactionalRepository
  implements CustomerPaymentRepository
{
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  public async findById(organizationId: string, paymentId: string) {
    const [rows, error] = await tryCatch(
      this.db
        .select()
        .from(customerPayment)
        .where(
          and(
            eq(customerPayment.id, paymentId),
            eq(customerPayment.organizationId, organizationId),
          ),
        )
        .limit(1),
    );

    if (error) return err(error);

    const data = rows.at(0);

    if (!data) return ok(null);

    return ok(CustomerPayment.reconstitute(data));
  }

  public async findByCustomer(organizationId: string, customerId: string) {
    const [rows, error] = await tryCatch(
      this.db
        .select()
        .from(customerPayment)
        .where(
          and(
            eq(customerPayment.organizationId, organizationId),
            eq(customerPayment.customerId, customerId),
          ),
        ),
    );

    if (error) return err(error);

    return ok(rows.map((r) => CustomerPayment.reconstitute(r)));
  }

  public async findActiveByCustomer(
    organizationId: string,
    customerId: string,
  ) {
    const [rows, error] = await tryCatch(
      this.db
        .select()
        .from(customerPayment)
        .where(
          and(
            eq(customerPayment.organizationId, organizationId),
            eq(customerPayment.customerId, customerId),
            eq(customerPayment.status, "active"),
          ),
        ),
    );

    if (error) return err(error);

    return ok(rows.map((r) => CustomerPayment.reconstitute(r)));
  }

  private async saveContent(paymentEntity: CustomerPayment, options: Options) {
    const values = paymentEntity.values;

    const [, errInsert] = await tryCatch(
      (options.tx ?? this.db)
        .insert(customerPayment)
        .values({
          id: values.id,
          customerId: values.customerId,
          amount: values.amount,
          method: values.method,
          status: values.status,
          notes: values.notes,
          cancelledAt: values.cancelledAt,
          cancelReason: values.cancelReason,
          organizationId: values.organizationId,
          createdBy: values.createdBy,
          createdAt: values.createdAt,
          updatedAt: values.updatedAt,
        })
        .onConflictDoUpdate({
          target: customerPayment.id,
          set: {
            status: values.status,
            notes: values.notes,
            cancelledAt: values.cancelledAt,
            cancelReason: values.cancelReason,
            updatedAt: values.updatedAt,
          },
        }),
    );

    if (errInsert) throw errInsert;
  }

  public async save(paymentEntity: CustomerPayment, options?: Options) {
    if (options?.tx) {
      return tryCatch(this.saveContent(paymentEntity, options));
    }

    const transaction = this.db.transaction(async (tx) => {
      await this.saveContent(paymentEntity, { tx });
    });

    return tryCatch(transaction);
  }
}
