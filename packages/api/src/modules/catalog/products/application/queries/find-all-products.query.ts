import { jsonObject, type DatabaseService } from "@fludge/db";
import {
  product,
  productPresentation,
  type ProductPresentationSelect,
} from "@fludge/db/schema/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/server";
import { eq, getColumns, sql } from "drizzle-orm";

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
        .innerJoin(
          productPresentation,
          eq(productPresentation.productId, product.id),
        )
        .where(eq(product.organizationId, organizationId))
        .orderBy(product.createdAt)
        .groupBy(product.id),
    );

    if (err)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al consultar los productos",
        cause: err.cause,
      });

    return rows.map((r) => ({
      ...r,
      presentations: (
        JSON.parse(r.presentations) as ProductPresentationSelect[]
      ).map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      })),
    }));
  }
}
