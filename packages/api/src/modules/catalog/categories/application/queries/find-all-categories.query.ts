import type { DatabaseService } from "@fludge/db";
import { category } from "@fludge/db/schema/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import type { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";
import { eq, desc } from "drizzle-orm";

export class FindAllCategoriesQuery {
  constructor(private readonly db: DatabaseService) {}

  public async execute(organizationId: UUID) {
    const [rows, errFinding] = await tryCatch(
      this.db
        .select()
        .from(category)
        .where(eq(category.organizationId, organizationId.toString()))
        .orderBy(desc(category.createdAt)),
    );

    if (errFinding)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al obtener las categorías",
        cause: errFinding.cause,
      });

    return rows;
  }
}
