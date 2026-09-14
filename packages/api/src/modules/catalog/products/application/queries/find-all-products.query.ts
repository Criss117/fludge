import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { DatabaseService } from "@fludge/db";
import {
  product,
  productPresentation,
  type ProductPresentationSelect,
} from "@fludge/db/schema/catalog.schema";
import { jsonObject } from "@fludge/db/utils/build-queries";
import { tryCatch } from "@fludge/utils/trycatch";
import { desc, eq, getColumns, sql } from "drizzle-orm";

export class FindAllProductsQuery {
  constructor(private readonly db: DatabaseService) {}

  public async execute(organizationId: string) {
    const [rows, err] = await tryCatch(
      this.db
        .select({
          ...getColumns(product),
          presentations: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(productPresentation)}
            ) FILTER (WHERE ${productPresentation.productId} IS NOT NULL)
          `.as("presentations"),
        })
        .from(product)
        .leftJoin(
          productPresentation,
          eq(productPresentation.productId, product.id),
        )
        .where(eq(product.organizationId, organizationId))
        .orderBy(desc(product.createdAt))
        .groupBy(product.id),
    );

    if (err)
      throw new InternalServerError(
        err,
        "api_errors.catalog.products.isr_on_find",
      );

    return rows.map((p) => ({
      ...p,
      presentations: p.presentations
        ? (JSON.parse(p.presentations) as ProductPresentationSelect[]).map(
            (pres) => ({
              ...pres,
              createdAt: new Date(pres.createdAt),
              updatedAt: new Date(pres.updatedAt),
            }),
          )
        : [],
    }));
  }
}
