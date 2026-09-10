import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { jsonObject, type DatabaseService } from "@fludge/db";
import {
  sale,
  saleItem,
  type SaleItemSelect,
} from "@fludge/db/schema/sales.schema";
import { tryCatch } from "@fludge/utils/trycatch";
import { eq, getColumns, sql } from "drizzle-orm";

export class FindAllSalesQuery {
  constructor(public readonly db: DatabaseService) {}

  public async execute(activeOrganization: Organization) {
    const [rows, error] = await tryCatch(
      this.db
        .select({
          ...getColumns(sale),
          items: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(saleItem)}
            ) FILTER (WHERE ${saleItem.saleId} IS NOT NULL)
          `.as("items"),
        })
        .from(sale)
        .innerJoin(saleItem, eq(saleItem.saleId, sale.id))
        .where(eq(sale.organizationId, activeOrganization.id.toString()))
        .groupBy(sale.id),
    );

    if (error)
      throw new InternalServerError(error, "api_errors.sales.isr_on_find");

    return rows.map((r) => {
      const items = (JSON.parse(r.items) as SaleItemSelect[]).map((i) => ({
        ...i,
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt),
      }));

      return {
        ...r,
        items,
      };
    });
  }
}
