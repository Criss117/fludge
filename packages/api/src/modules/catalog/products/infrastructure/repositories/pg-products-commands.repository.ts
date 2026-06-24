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