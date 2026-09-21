import { ok, type Result } from "@fludge/utils/trycatch";
import { Customer } from "@fludge/api/modules/customer/domain/entities/customer.entity";
import type { CustomerRepository } from "@fludge/api/modules/customer/domain/repositories/customer.repository";
import type { TransactionService } from "@fludge/db";

/**
 * Test double de CustomerRepository.
 * Guarda los clientes en un Map en memoria keyed por `${organizationId}:${customerId}`.
 */
export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly store = new Map<string, Customer>();

  private key(organizationId: string, customerId: string): string {
    return `${organizationId}:${customerId}`;
  }

  public getAll(organizationId?: string): Customer[] {
    const customers = Array.from(this.store.values());

    return organizationId
      ? customers.filter((c) =>
          this.store.has(this.key(organizationId, c.values.id)),
        )
      : customers;
  }

  public clear(): void {
    this.store.clear();
  }

  public async findById(
    organizationId: string,
    customerId: string,
  ): Promise<Result<Customer | null, Error>> {
    const customer = this.store.get(this.key(organizationId, customerId));

    return customer ? ok(customer) : ok(null);
  }

  public async findByDocument(
    organizationId: string,
    documentNumber: string,
  ): Promise<Result<Customer | null, Error>> {
    for (const customer of this.store.values()) {
      const values = customer.values;

      if (
        values.organizationId === organizationId &&
        values.documentNumber === documentNumber
      ) {
        return ok(customer);
      }
    }

    return ok(null);
  }

  public async save(
    customerEntity: Customer,
    _options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>> {
    const values = customerEntity.values;

    this.store.set(this.key(values.organizationId, values.id), customerEntity);

    return ok(undefined);
  }
}