import { ok, type Result } from "@fludge/utils/trycatch";
import type { SaleSequenceRepository } from "@fludge/api/modules/sales/domain/repositories/sale-sequence.repository";
import type { TransactionService } from "@fludge/db";

/**
 * Test double de SaleSequenceRepository.
 * Devuelve una secuencia configurable (default 1) por organización.
 */
export class InMemorySaleSequenceRepository implements SaleSequenceRepository {
  private counters = new Map<string, number>();

  public setNext(organizationId: string, value: number): void {
    this.counters.set(organizationId, value);
  }

  public clear(): void {
    this.counters.clear();
  }

  public async getNextSequence(
    organizationId: string,
    _options?: { tx?: TransactionService },
  ): Promise<Result<number, Error>> {
    const current = this.counters.get(organizationId) ?? 0;
    const next = current + 1;

    this.counters.set(organizationId, next);

    return ok(next);
  }
}