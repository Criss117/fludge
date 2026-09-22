import { ok, type Result } from "@fludge/utils/trycatch";
import { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";
import type { SaleRepository } from "@fludge/api/modules/sales/domain/repositories/sale.repository";
import type { TransactionService } from "@fludge/db";
import { DummyTransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";

export class InMemorySaleRepository
  extends DummyTransactionalRepository
  implements SaleRepository
{
  constructor() {
    super();
  }

  public async findByCustomer(
    organizationId: string,
    customerId: string,
  ): Promise<Result<Sale[], Error>> {
    const sales = Array.from(this.store.values()).filter(
      (s) =>
        s.values.organizationId === organizationId &&
        s.values.customerId === customerId,
    );

    return ok(sales);
  }

  public async saveOnlySales(
    saleEntities: Sale[],
    _options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>> {
    for (const sale of saleEntities) {
      this.store.set(
        this.key(sale.values.organizationId, sale.id.toString()),
        sale,
      );
    }

    return ok(undefined);
  }

  private readonly store = new Map<string, Sale>();

  private key(organizationId: string, saleId: string): string {
    return `${organizationId}:${saleId}`;
  }

  public getAll(organizationId?: string): Sale[] {
    const sales = Array.from(this.store.values());

    return organizationId
      ? sales.filter((s) =>
          this.store.has(this.key(organizationId, s.id.toString())),
        )
      : sales;
  }

  public clear(): void {
    this.store.clear();
  }

  public async findById(
    organizationId: string,
    saleId: string,
  ): Promise<Result<Sale | null, Error>> {
    const sale = this.store.get(this.key(organizationId, saleId));

    return sale ? ok(sale) : ok(null);
  }

  public async save(
    saleEntity: Sale,
    _options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>> {
    this.store.set(
      this.key(saleEntity.values.organizationId, saleEntity.id.toString()),
      saleEntity,
    );

    return ok(undefined);
  }

  public async saveOnlySale(
    saleEntity: Sale,
    _options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>> {
    return this.save(saleEntity);
  }
}
