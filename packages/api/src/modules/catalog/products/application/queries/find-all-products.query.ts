import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

import type { DBConnection } from "@fludge/db";
import {
  product,
  productPresentation,
  type ProductPresentationSelect,
} from "@fludge/db/schemas/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  organizationId: string;
};

export class FindAllProductsQuery {
  constructor(private readonly db: DBConnection) {}

  public async execute(query: Query) {
    const [data, error] = await tryCatch(
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
        .where(eq(product.organizationId, query.organizationId))
        .orderBy(desc(product.createdAt)),
    );

    if (error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Algo salió mal al buscar productos",
      });

    return data;
  }
}
