import {
  buildConflictUpdateColumn,
  type DatabaseService,
  type TransactionService,
} from "@fludge/db";
import { TransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";
import { tryCatch } from "@fludge/utils/trycatch";
import { productPresentation } from "@fludge/db/schema/catalog.schema";
import type { ProductPresentation } from "@fludge/api/modules/catalog/products/domain/entities/product-presentation.entity";
import { and, eq, inArray } from "drizzle-orm";

type Options = {
  tx?: TransactionService;
};

export class ProductPresentationRepository extends TransactionalRepository {
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  public async save(
    productId: string,
    presentations: readonly ProductPresentation[],
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    return tryCatch(
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
  }

  public async deleteMany(
    organizationId: string,
    productId: string,
    presentationIds: string[],
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    return tryCatch(
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
  }

  public async deleteAll(
    organizationId: string,
    productId: string,
    options?: Options,
  ) {
    const db = options?.tx ?? this.db;

    return tryCatch(
      db
        .delete(productPresentation)
        .where(
          and(
            eq(productPresentation.organizationId, organizationId),
            eq(productPresentation.productId, productId),
          ),
        ),
    );
  }
}
