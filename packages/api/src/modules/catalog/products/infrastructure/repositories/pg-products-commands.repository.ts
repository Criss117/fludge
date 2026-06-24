import { eq, and, ne } from "drizzle-orm";

import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DbConnection } from "@fludge/db";
import {
  product,
  type ProductInsert,
} from "@fludge/db/schemas/catalog.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

export type ProductUpdatable = Partial<
  Pick<
    ProductInsert,
    | "name"
    | "slug"
    | "description"
    | "imageUrl"
    | "categoryId"
    | "sku"
    | "barcode"
    | "priceRetail"
    | "pricePurchase"
    | "priceWholesale"
    | "stockQuantity"
    | "minimumStock"
    | "allowNegativeStock"
    | "status"
  >
>;

export class PGProductsCommandsRepository extends TransactionalRepository {
  constructor(private readonly db: DbConnection) {
    super(db);
  }

  public async save(
    values: ProductInsert,
    options?: TransactionalOptions,
  ) {
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

  public async findOne(id: string, organizationId: string) {
    const [rows, error] = await tryCatch(
      this.db
        .select()
        .from(product)
        .where(
          and(eq(product.id, id), eq(product.organizationId, organizationId)),
        )
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const p = rows.at(0);

    if (!p) return ok(null);

    return ok(p);
  }

  public async update(
    id: string,
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
          and(eq(product.id, id), eq(product.organizationId, organizationId)),
        )
        .returning()
        .execute(),
    );

    if (error) return err(error);

    const updated = data.at(0);

    if (!updated) return ok(null);

    return ok(updated);
  }

  public async slugAvailable(
    slug: string,
    organizationId: string,
    excludeId?: string,
  ) {
    const conditions = [
      eq(product.organizationId, organizationId),
      eq(product.slug, slug),
    ];

    if (excludeId) {
      conditions.push(ne(product.id, excludeId));
    }

    const [rows, error] = await tryCatch(
      this.db
        .select({ id: product.id })
        .from(product)
        .where(and(...conditions))
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const p = rows.at(0);

    if (!p) return ok(true);

    return ok(false);
  }

  public async nameExists(
    name: string,
    organizationId: string,
    excludeId?: string,
  ) {
    const conditions = [
      eq(product.organizationId, organizationId),
      eq(product.name, name),
    ];

    if (excludeId) {
      conditions.push(ne(product.id, excludeId));
    }

    const [rows, error] = await tryCatch(
      this.db
        .select({ id: product.id })
        .from(product)
        .where(and(...conditions))
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const p = rows.at(0);

    if (!p) return ok(false);

    return ok(true);
  }

  public async barcodeExists(
    barcode: string,
    organizationId: string,
    excludeId?: string,
  ) {
    const conditions = [
      eq(product.organizationId, organizationId),
      eq(product.barcode, barcode),
    ];

    if (excludeId) {
      conditions.push(ne(product.id, excludeId));
    }

    const [rows, error] = await tryCatch(
      this.db
        .select({ id: product.id })
        .from(product)
        .where(and(...conditions))
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const p = rows.at(0);

    if (!p) return ok(false);

    return ok(true);
  }

  public async skuExists(
    sku: string,
    organizationId: string,
    excludeId?: string,
  ) {
    const conditions = [
      eq(product.organizationId, organizationId),
      eq(product.sku, sku),
    ];

    if (excludeId) {
      conditions.push(ne(product.id, excludeId));
    }

    const [rows, error] = await tryCatch(
      this.db
        .select({ id: product.id })
        .from(product)
        .where(and(...conditions))
        .limit(1)
        .execute(),
    );

    if (error) return err(error);

    const p = rows.at(0);

    if (!p) return ok(false);

    return ok(true);
  }
}