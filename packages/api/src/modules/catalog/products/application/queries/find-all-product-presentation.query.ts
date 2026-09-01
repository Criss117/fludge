import type { DatabaseService } from "@fludge/db";
import { productPresentation } from "@fludge/db/schema/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/server";
import { desc, eq } from "drizzle-orm";

export class FindAllProductPresentationQuery {
  constructor(private readonly db: DatabaseService) {}

  public async execute(organizationId: string) {
    const [rows, err] = await tryCatch(
      this.db
        .select()
        .from(productPresentation)
        .where(eq(productPresentation.organizationId, organizationId))
        .orderBy(desc(productPresentation.createdAt)),
    );

    if (err)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al consultar las presentaciones",
        cause: err.cause,
      });

    return rows;
  }
}
