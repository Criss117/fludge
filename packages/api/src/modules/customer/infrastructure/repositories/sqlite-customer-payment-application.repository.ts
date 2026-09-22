import { TransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";
import type { DatabaseService, TransactionService } from "@fludge/db";
import { customerPaymentApplication } from "@fludge/db/schema/customer-payment-application.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { eq } from "drizzle-orm";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { CustomerPaymentApplication } from "@fludge/api/modules/customer/domain/entities/customer-payment-application.entity";
import type { CustomerPaymentApplicationRepository } from "@fludge/api/modules/customer/domain/repositories/customer-payment-application.repository";

type Options = {
  tx?: TransactionService;
};

export class SQLiteCustomerPaymentApplicationRepository
  extends TransactionalRepository
  implements CustomerPaymentApplicationRepository
{
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  public async findByPaymentId(
    _organizationId: string,
    paymentId: string,
  ) {
    const [rows, error] = await tryCatch(
      this.db
        .select()
        .from(customerPaymentApplication)
        .where(eq(customerPaymentApplication.paymentId, paymentId)),
    );

    if (error) return err(error);

    return ok(rows.map((r) => CustomerPaymentApplication.reconstitute(r)));
  }

  private async saveContent(
    application: CustomerPaymentApplication,
    options: Options,
  ) {
    const values = application.values;

    const [, errInsert] = await tryCatch(
      (options.tx ?? this.db)
        .insert(customerPaymentApplication)
        .values({
          paymentId: values.paymentId,
          saleId: values.saleId,
          amount: values.amount,
          createdAt: values.createdAt,
        })
        .onConflictDoUpdate({
          target: [
            customerPaymentApplication.paymentId,
            customerPaymentApplication.saleId,
          ],
          set: {
            amount: values.amount,
          },
        }),
    );

    if (errInsert) throw errInsert;
  }

  public async save(
    application: CustomerPaymentApplication,
    options?: Options,
  ) {
    if (options?.tx) {
      return tryCatch(this.saveContent(application, options));
    }

    const transaction = this.db.transaction(async (tx) => {
      await this.saveContent(application, { tx });
    });

    return tryCatch(transaction);
  }

  private async saveManyContent(
    applications: CustomerPaymentApplication[],
    options: Options,
  ) {
    if (applications.length === 0) return;

    const values = applications.map((app) => app.values);

    const [, errInsert] = await tryCatch(
      (options.tx ?? this.db)
        .insert(customerPaymentApplication)
        .values(values)
        .onConflictDoUpdate({
          target: [
            customerPaymentApplication.paymentId,
            customerPaymentApplication.saleId,
          ],
          set: buildConflictUpdateColumn(customerPaymentApplication, [
            "amount",
          ]),
        }),
    );

    if (errInsert) throw errInsert;
  }

  public async saveMany(
    applications: CustomerPaymentApplication[],
    options?: Options,
  ) {
    if (options?.tx) {
      return tryCatch(this.saveManyContent(applications, options));
    }

    const transaction = this.db.transaction(async (tx) => {
      await this.saveManyContent(applications, { tx });
    });

    return tryCatch(transaction);
  }
}