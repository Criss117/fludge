import { ok, type Result } from "@fludge/utils/trycatch";
import { CustomerPaymentApplication } from "@fludge/api/modules/customer/domain/entities/customer-payment-application.entity";
import type { CustomerPaymentApplicationRepository } from "@fludge/api/modules/customer/domain/repositories/customer-payment-application.repository";
import type { TransactionService } from "@fludge/db";
import { DummyTransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";

export class InMemoryCustomerPaymentApplicationRepository
  extends DummyTransactionalRepository
  implements CustomerPaymentApplicationRepository
{
  private readonly store = new Map<string, CustomerPaymentApplication>();

  private key(paymentId: string, saleId: string): string {
    return `${paymentId}:${saleId}`;
  }

  public getAll(): CustomerPaymentApplication[] {
    return Array.from(this.store.values());
  }

  public clear(): void {
    this.store.clear();
  }

  public async findByPaymentId(
    _organizationId: string,
    paymentId: string,
  ): Promise<Result<CustomerPaymentApplication[], Error>> {
    const applications = Array.from(this.store.values()).filter(
      (app) => app.values.paymentId === paymentId,
    );

    return ok(applications);
  }

  public async save(
    application: CustomerPaymentApplication,
    _options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>> {
    this.store.set(
      this.key(application.values.paymentId, application.values.saleId),
      application,
    );

    return ok(undefined);
  }

  public async saveMany(
    applications: CustomerPaymentApplication[],
    _options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>> {
    for (const application of applications) {
      this.store.set(
        this.key(
          application.values.paymentId,
          application.values.saleId,
        ),
        application,
      );
    }

    return ok(undefined);
  }
}