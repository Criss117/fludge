import {
  buildConflictUpdateColumn,
  type DatabaseService,
  type TransactionService,
} from "@fludge/db";
import { saleItem } from "@fludge/db/schema/sales.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";

type Options = {
  tx?: TransactionService;
};

export class SaleItemRepository {
  constructor(private readonly db: DatabaseService) {}

  public async save(saleEntity: Sale, options?: Options) {
    const db = options?.tx ?? this.db;

    const items = saleEntity.values.items;

    return tryCatch(
      db
        .insert(saleItem)
        .values(items)
        .onConflictDoUpdate({
          target: saleItem.id,
          set: buildConflictUpdateColumn(saleItem, [
            "quantity",
            "subtotal",
            "productPresentationPrice",
          ]),
        }),
    );
  }
}
