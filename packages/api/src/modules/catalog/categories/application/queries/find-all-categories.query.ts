import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { DatabaseService } from "@fludge/db";
import { category } from "@fludge/db/schema/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import type { UUID } from "@fludge/utils/uuid";
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
      throw new InternalServerError(
        errFinding,
      "api_errors.catalog.categories.isr_on_find",
      );

    return rows;
  }
}
