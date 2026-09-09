import type { DatabaseService } from "@fludge/db";
import { product, productPresentation } from "@fludge/db/schema/catalog.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, inArray } from "drizzle-orm";

export class EnsurePresentationsExistsService {
  constructor(private readonly db: DatabaseService) {}

  public async execute(
    organizationId: string,
    presentationId: string | string[],
  ) {
    const ids = Array.isArray(presentationId)
      ? presentationId
      : [presentationId];

    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          id: productPresentation.id,
          productId: product.id,
        })
        .from(productPresentation)
        .innerJoin(product, eq(product.id, productPresentation.productId))
        .where(
          and(
            eq(productPresentation.organizationId, organizationId),
            inArray(productPresentation.id, ids),
          ),
        ),
    );

    if (errFind) return err(errFind);

    if (rows.length !== ids.length) return ok(new Map<string, string[]>());

    const gruped = rows.reduce((acc, row) => {
      const key = row.productId;

      const value = acc.get(key);

      if (value) {
        acc.set(key, [...value, row.id]);
      } else {
        acc.set(key, [row.id]);
      }

      return acc;
    }, new Map<string, string[]>());

    return ok(gruped);
  }
}
