import {
  buildConflictUpdateColumn,
  type DatabaseService,
  type TransactionService,
} from "@fludge/db";
import type { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import { TransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";
import { tryCatch } from "@fludge/utils/trycatch";
import { productPresentation } from "@fludge/db/schema/catalog.schema";

type Options = {
  tx?: TransactionService;
};

export class ProductPresentationRepository extends TransactionalRepository {
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  public async save(productEntity: Product, options?: Options) {
    const db = options?.tx ?? this.db;

    const values = productEntity.values.presentations;

    return tryCatch(
      db
        .insert(productPresentation)
        .values(values)
        .onConflictDoUpdate({
          target: productPresentation.id,
          set: buildConflictUpdateColumn(productPresentation, [
            "barcode",
            "conversionFactor",
            "name",
            "searchName",
            "pricePurchase",
            "priceSale",
            "priceWholesale",
            "status",
            "updatedAt",
          ]),
        }),
    );
  }
}
