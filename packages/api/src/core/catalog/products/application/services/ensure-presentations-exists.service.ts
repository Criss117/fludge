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

    const foundIds = new Set(rows.map((row) => row.id));

    if (!ids.every((id) => foundIds.has(id))) return ok(null);

    const grouped = rows.reduce((acc, row) => {
      const value = acc.get(row.productId);

      if (value) {
        acc.set(row.productId, [...value, row.id]);
      } else {
        acc.set(row.productId, [row.id]);
      }

      return acc;
    }, new Map<string, string[]>());

    return ok(grouped);
  }
}