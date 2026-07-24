import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import { buildConflictUpdateColumns, type DBConnection } from "@fludge/db";
import {
  productPresentation,
  type ProductPresentationInsert,
} from "@fludge/db/schemas/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";

export class PGProductPresentationRepository extends TransactionalRepository {
  constructor(private readonly db: DBConnection) {
    super(db);
  }

  public async save(
    values: ProductPresentationInsert[],
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    return tryCatch(
      db
        .insert(productPresentation)
        .values(values)
        .onConflictDoUpdate({
          target: [productPresentation.id],
          set: buildConflictUpdateColumns(productPresentation, [
            "name",
            "barcode",
            "imageUrl",
            "unitLabel",
            "conversionFactor",
            "priceRetail",
            "pricePurchase",
            "priceWholesale",
          ]),
        })
        .returning()
        .execute(),
    );
  }
}
