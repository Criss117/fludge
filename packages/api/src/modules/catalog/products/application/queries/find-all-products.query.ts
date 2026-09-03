import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { type DatabaseService } from "@fludge/db";
import { product, productPresentation } from "@fludge/db/schema/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { count, desc, eq, getColumns } from "drizzle-orm";

export class FindAllProductsQuery {
  constructor(private readonly db: DatabaseService) {}

  public async execute(organizationId: string) {
    const [rows, err] = await tryCatch(
      this.db
        .select({
          ...getColumns(product),
          totalPresentations: count(productPresentation.id),
        })
        .from(product)
        .innerJoin(
          productPresentation,
          eq(productPresentation.productId, product.id),
        )
        .where(eq(product.organizationId, organizationId))
        .orderBy(desc(product.createdAt))
        .groupBy(product.id),
    );

    if (err)
      throw new InternalServerError(err, "api_errors.catalog.products.isr_on_find");

    return rows;
  }
}
