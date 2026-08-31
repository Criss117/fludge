import type { DatabaseService } from "@fludge/db";
import { product, productPresentation } from "@fludge/db/schema/catalog.schema";
import { and, eq, inArray, ne, or, SQL } from "drizzle-orm";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

type Values = {
  slug?: string;
  name?: string;
};

export class ProductUniquenessValidator {
  constructor(private readonly db: DatabaseService) {}

  public async validateUniqueFields(
    organizationId: string,
    value: Values,
    excludeId?: string,
  ) {
    const { name, slug } = value;

    const orConditions = [
      name && eq(product.name, name),
      slug && eq(product.slug, slug),
    ].filter(Boolean) as SQL[];

    if (orConditions.length === 0)
      return ok({
        nameTaken: false,
        slugTaken: false,
      });

    const conditions = [or(...orConditions)];

    if (excludeId) conditions.push(ne(product.id, excludeId));

    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          name: product.name,
          slug: product.slug,
        })
        .from(product)
        .where(and(eq(product.organizationId, organizationId), ...conditions)),
    );

    if (errFind) return err(errFind);

    const nameTaken = rows.some((r) => r.name === name);
    const slugTaken = rows.some((r) => r.slug === slug);

    return ok({
      nameTaken,
      slugTaken,
    });
  }

  public async validateUniqueBarcode(
    organizationId: string,
    barcodes: string | string[],
    excludeId?: string,
  ) {
    const ids = Array.isArray(barcodes) ? barcodes : [barcodes];

    const conditions = [
      eq(productPresentation.organizationId, organizationId),
      inArray(productPresentation.barcode, ids),
    ];

    if (excludeId) conditions.push(ne(productPresentation.id, excludeId));

    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          id: productPresentation.id,
          barcode: productPresentation.barcode,
        })
        .from(productPresentation)
        .where(and(...conditions)),
    );

    if (errFind) return err(errFind);

    const barcodesTaken = rows.length > 0;

    return ok({
      barcodesTaken,
    });
  }
}
