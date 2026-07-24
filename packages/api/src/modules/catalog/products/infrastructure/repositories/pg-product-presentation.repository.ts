import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import { buildConflictUpdateColumns, type DBConnection } from "@fludge/db";
import {
  productPresentation,
  type ProductPresentationInsert,
} from "@fludge/db/schemas/catalog.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, inArray } from "drizzle-orm";

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

  public async hardDelete(
    organizationId: string,
    productPresentationIds: string[],
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .delete(productPresentation)
        .where(
          and(
            eq(productPresentation.organizationId, organizationId),
            inArray(productPresentation.id, productPresentationIds),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }
}
