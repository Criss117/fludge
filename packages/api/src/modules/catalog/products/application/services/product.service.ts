import type { DbConnection } from "@fludge/db";
import { product } from "@fludge/db/schemas/catalog.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, ne, or, type SQL } from "drizzle-orm";

export class ProductService {
  constructor(private readonly db: DbConnection) {}

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

  public async checkUniqueFields(
    values: {
      slug?: string;
      name?: string;
      barcode?: string;
    },
    organizationId: string,
    excludeId?: string,
  ) {
    const { slug, name, barcode } = values;

    const orConditions = [
      slug ? eq(product.slug, slug) : undefined,
      name ? eq(product.name, name) : undefined,
      barcode ? eq(product.barcode, barcode) : undefined,
    ].filter(Boolean) as SQL[];

    // Si no hay ningún valor para comparar, no hay nada que consultar
    if (orConditions.length === 0) {
      return ok({
        slugTaken: false,
        nameTaken: false,
        barcodeTaken: false,
        skuTaken: false,
      });
    }

    const conditions = [
      eq(product.organizationId, organizationId),
      or(...orConditions),
    ];

    if (excludeId) {
      conditions.push(ne(product.id, excludeId));
    }

    const [rows, error] = await tryCatch(
      this.db
        .select({
          slug: product.slug,
          name: product.name,
          barcode: product.barcode,
        })
        .from(product)
        .where(and(...conditions))
        .execute(),
    );

    if (error) return err(error);

    const slugTaken = slug ? rows.some((r) => r.slug === slug) : false;
    const nameTaken = name ? rows.some((r) => r.name === name) : false;
    const barcodeTaken = barcode
      ? rows.some((r) => r.barcode === barcode)
      : false;

    return ok({
      slugTaken,
      nameTaken,
      barcodeTaken,
    });
  }
}
