import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { jsonObject, type DatabaseService } from "@fludge/db";
import {
  product,
  productPresentation,
  type ProductPresentationSelect,
} from "@fludge/db/schema/catalog.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { desc, eq, getColumns, sql } from "drizzle-orm";

export class FindAllProductsQuery {
  constructor(private readonly db: DatabaseService) {}

  public async execute(organizationId: string) {
    const presentationsSub = this.db
      .select({
        productId: productPresentation.productId,
        presentations: sql<string>`
          json_group_array(json(${jsonObject(productPresentation)}))
        `.as("presentations"),
      })
      .from(
        this.db
          .selectDistinct({
            productId: productPresentation.productId,
            presentationJson:
              jsonObject(productPresentation).as("presentation_json"),
            createdAt: productPresentation.createdAt,
          })
          .from(productPresentation)
          .orderBy(desc(productPresentation.createdAt))
          .as("ordered_presentations"),
      )
      .groupBy(sql`productId`)
      .as("presentations_agg");

    const [rows, err] = await tryCatch(
      this.db
        .select({
          ...getColumns(product),
          presentations: presentationsSub.presentations,
        })
        .from(product)
        .leftJoin(presentationsSub, eq(presentationsSub.productId, product.id))
        .where(eq(product.organizationId, organizationId))
        .orderBy(desc(product.createdAt)),
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
