import type { ProductPresentation } from "@fludge/api/core/catalog/products/domain/entities/product-presentation.entity";
import type {
  Options,
  ProductPresentationRepository,
} from "@fludge/api/core/catalog/products/domain/repositories/product-presentation.repository";
import type { DatabaseService } from "@fludge/db";
import { productPresentation } from "@fludge/db/schema/catalog.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, inArray } from "drizzle-orm";

export class SQLiteProductPresentationRepository implements ProductPresentationRepository {
  constructor(private readonly db: DatabaseService) {}

  public async save(
    productId: string,
    presentations: readonly ProductPresentation[],
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    const [, errSave] = await tryCatch(
      db
        .insert(productPresentation)
        .values(presentations.map((p) => ({ ...p.values, productId })))
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

  public async deleteMany(
    organizationId: string,
    productId: string,
    presentationIds: string[],
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    const [, errDelete] = await tryCatch(
      db
        .delete(productPresentation)
        .where(
          and(
            eq(productPresentation.organizationId, organizationId),
            eq(productPresentation.productId, productId),
            inArray(productPresentation.id, presentationIds),
          ),
        ),
    );

    if (errDelete) return err(errDelete);

    return ok(undefined);
  }
}
