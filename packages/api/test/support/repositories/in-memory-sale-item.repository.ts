import { ok, type Result } from "@fludge/utils/trycatch";
import { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";
import type { SaleItemRepository } from "@fludge/api/modules/sales/domain/repositories/sale-item.repository";
import type { TransactionService } from "@fludge/db";

/**
 * Test double de SaleItemRepository.
 * No mantiene estado propio: la persistencia real de items se testea vía
 * SaleRepository (que serializa items dentro de la venta). Este double solo
 * registra las llamadas para verificar el contrato.
 */
export class InMemorySaleItemRepository implements SaleItemRepository {
  public savedSales: Sale[] = [];

  public clear(): void {
    this.savedSales = [];
  }

  public async save(
    saleEntity: Sale,
    _options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>> {
    this.savedSales.push(saleEntity);

    return ok(undefined);
  }
}