import { eq, and, inArray, getTableColumns, sql } from "drizzle-orm";
import { Decimal } from "decimal.js";

import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DBConnection } from "@fludge/db";
import {
  product,
  inventoryMovement,
  type InventoryMovementInsert,
  type InventoryMovementSelect,
  type ProductInsert,
  productPresentation,
  type ProductPresentationSelect,
} from "@fludge/db/schemas/catalog.schema";
import { err, ok, tryCatch, type Result } from "@fludge/utils/trycatch";

export type ProductUpdatable = Omit<ProductInsert, "id" | "organizationId">;

export class PGProductRepository extends TransactionalRepository {
  constructor(private readonly db: DBConnection) {
    super(db);
  }

  public async save(values: ProductInsert, options?: TransactionalOptions) {
    const db = options?.tx ?? this.db;

    const [data, error] = await tryCatch(
      db
        .insert(product)
        .values({ ...values, status: "active" })
        .returning()
        .execute(),
    );

    if (error) return err(error);

    const created = data.at(0);

    if (!created) return err(new Error("Error creando producto"));

    return ok(created);
  }

  public async insertInventoryMovement(
    values: InventoryMovementInsert,
    options?: TransactionalOptions,
  ): Promise<Result<InventoryMovementSelect, Error>> {
    const db = options?.tx ?? this.db;

    const [data, error] = await tryCatch(
      db.insert(inventoryMovement).values(values).returning().execute(),
    );

    if (error) return err(error);

    const created = data.at(0);

    if (!created)
      return err(new Error("Error creando movimiento de inventario"));

    return ok(created);
  }

  public async findOne(id: string, organizationId: string) {
    const [rows, error] = await tryCatch(
      this.db
        .select({
          ...getTableColumns(product),
          presentations: sql<ProductPresentationSelect[]>`
            COALESCE(
              json_agg(
                json_build_object(
                  'id': ${productPresentation.id},
                  'organizationId': ${productPresentation.organizationId},
                  'barcode': ${productPresentation.barcode},
                  'name': ${productPresentation.name},
                  'conversionFactor': ${productPresentation.conversionFactor},
                  'createdBy': ${productPresentation.createdBy},
                  'imageUrl': ${productPresentation.imageUrl},
                  'pricePurchase': ${productPresentation.pricePurchase},
                  'priceRetail': ${productPresentation.priceRetail},
                  'priceWholesale': ${productPresentation.priceWholesale},
                  'productId': ${productPresentation.productId},
                  'status': ${productPresentation.status},
                  'unitLabel': ${productPresentation.unitLabel},
                  'deletedReason': ${productPresentation.deletedReason},
                  'createdAt': ${productPresentation.createdAt},
                  'updatedAt': ${productPresentation.updatedAt},
                  'deletedAt': ${productPresentation.deletedAt}
                )
                ORDER BY ${productPresentation.createdAt} DESC
              ) FILTER (WHERE ${productPresentation.id} IS NOT NULL),
              '[]'::json
            ) AS presentations
          `,
        })
        .from(product)
        .innerJoin(
          productPresentation,
          eq(productPresentation.productId, product.id),
        )
        .where(
          and(eq(product.id, id), eq(product.organizationId, organizationId)),
        )
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const p = rows.at(0);

    if (!p) return ok(null);

    return ok({
      ...p,
      presentations: p.presentations.map((presentation) => ({
        ...presentation,
        priceRetail: new Decimal(presentation.priceRetail),
        pricePurchase: presentation.pricePurchase
          ? new Decimal(presentation.pricePurchase)
          : null,
        priceWholesale: presentation.priceWholesale
          ? new Decimal(presentation.priceWholesale)
          : null,
      })),
    });
  }

  public async update(
    productId: string,
    organizationId: string,
    values: ProductUpdatable,
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [data, error] = await tryCatch(
      db
        .update(product)
        .set(values)
        .where(
          and(
            eq(product.id, productId),
            eq(product.organizationId, organizationId),
          ),
        )
        .returning()
        .execute(),
    );

    if (error) return err(error);

    const updated = data.at(0);

    if (!updated) return ok(null);

    return ok(updated);
  }

  public async hardDelete(
    organizationId: string,
    productIds: string[],
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [, error] = await tryCatch(
      db
        .delete(product)
        .where(
          and(
            eq(product.organizationId, organizationId),
            inArray(product.id, productIds),
          ),
        )
        .execute(),
    );

    if (error) return err(error);

    return ok(null);
  }
}
