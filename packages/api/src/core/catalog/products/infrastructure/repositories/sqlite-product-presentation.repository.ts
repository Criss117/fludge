import type { ProductPresentation } from "@fludge/api/core/catalog/products/domain/entities/product-presentation.entity";
import type {
  Options,
  ProductPresentationRepository,
} from "@fludge/api/core/catalog/products/domain/repositories/product-presentation.repository";
import type { DatabaseService } from "@fludge/db";
import { productPresentation } from "@fludge/db/schema/catalog.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

export class SQLiteProductPresentationRepository implements ProductPresentationRepository {
  constructor(private readonly db: DatabaseService) {}

  public async save(presentations: ProductPresentation[], options?: Options) {
    const db = options?.tx ?? this.db;

    const [, errSave] = await tryCatch(
      db
        .insert(productPresentation)
        .values(presentations.map((p) => p.values))
        .onConflictDoUpdate({
          target: productPresentation.id,
          set: buildConflictUpdateColumn(productPresentation, [
            "barcode",
            "conversionFactor",
            "name",
            "searchBlob",
            "pricePurchase",
            "priceSale",
            "priceWholesale",
            "status",
            "updatedAt",
          ]),
        }),
    );

    if (errSave) return err(errSave);

    return ok(undefined);
  }
}
