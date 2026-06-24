import { desc, eq, getTableColumns } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { product } from "@fludge/db/schemas/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  organizationId: string;
};

export class FindAllProductsQuery {
  constructor(private readonly db: DbConnection) {}

  public async execute(query: Query) {
    const [data, error] = await tryCatch(
      this.db
        .select(getTableColumns(product))
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
