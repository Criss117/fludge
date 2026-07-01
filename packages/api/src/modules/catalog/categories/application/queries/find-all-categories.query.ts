import { desc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { category } from "@fludge/db/schemas/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  organizationId: string;
};

export class FindAllCategoriesQuery {
  constructor(private readonly db: DbConnection) {}

  public async execute(query: Query) {
    const [data, error] = await tryCatch(
      this.db
        .select()
        .from(category)
        .where(eq(category.organizationId, query.organizationId))
        .orderBy(desc(category.createdAt)),
    );

    if (error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Algo salió mal al buscar categorías",
      });

    return data;
  }
}
