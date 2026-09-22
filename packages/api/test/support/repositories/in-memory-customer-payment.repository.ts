import { ok, type Result } from "@fludge/utils/trycatch";
import { CustomerPayment } from "@fludge/api/modules/customer/domain/entities/customer-payment.entity";
import type { CustomerPaymentRepository } from "@fludge/api/modules/customer/domain/repositories/customer-payment.repository";
import type { TransactionService } from "@fludge/db";
import { DummyTransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";

export class InMemoryCustomerPaymentRepository
  extends DummyTransactionalRepository
  implements CustomerPaymentRepository
{
  private readonly store = new Map<string, CustomerPayment>();

  private key(organizationId: string, paymentId: string): string {
    return `${organizationId}:${paymentId}`;
  }

  public getAll(organizationId?: string): CustomerPayment[] {
    const payments = Array.from(this.store.values());

    return organizationId
      ? payments.filter((p) =>
          this.store.has(this.key(organizationId, p.values.id)),
        )
      : payments;
  }

  public clear(): void {
    this.store.clear();
  }

  public async findById(
    organizationId: string,
    paymentId: string,
  ): Promise<Result<CustomerPayment | null, Error>> {
    const payment = this.store.get(this.key(organizationId, paymentId));

    return payment ? ok(payment) : ok(null);
  }

  public async findByCustomer(
    organizationId: string,
    customerId: string,
  ): Promise<Result<CustomerPayment[], Error>> {
    const payments = Array.from(this.store.values()).filter(
      (p) =>
        p.values.organizationId === organizationId &&
        p.values.customerId === customerId,
    );

    return ok(payments);
  }

  public async findActiveByCustomer(
    organizationId: string,
    customerId: string,
  ): Promise<Result<CustomerPayment[], Error>> {
    const payments = Array.from(this.store.values()).filter(
      (p) =>
        p.values.organizationId === organizationId &&
        p.values.customerId === customerId &&
        p.values.status === "active",
    );

    return ok(payments);
  }

  public async save(
    payment: CustomerPayment,
    _options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>> {
    this.store.set(
      this.key(payment.values.organizationId, payment.values.id),
      payment,
    );

    return ok(undefined);
  }
}
