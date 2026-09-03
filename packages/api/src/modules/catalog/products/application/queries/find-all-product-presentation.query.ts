import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { DatabaseService } from "@fludge/db";
import { productPresentation } from "@fludge/db/schema/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";
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
      throw new InternalServerError(
        err,
        "catalog.products_presentations.errors.isr_on_find",
      );

    return rows;
  }
}
