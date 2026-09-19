import { DatabaseService } from "@/integrations/db";
import type {
  SaleDetail,
  SaleRepository,
} from "@fludge/client/application/sales/domain/sale.repository";
import {
  buildConflictUpdateColumn,
  jsonObject,
} from "@fludge/db/utils/build-queries";
import { desc, eq, getColumns, sql } from "drizzle-orm";
import {
  localSale,
  localSaleItem,
  type LocalSaleItemSelect,
  type LocalSaleSelect,
} from "@fludge/db/local-schemas/shared.schema";
import {
  type Cursor,
  type PaginatedResponse,
  paginate,
} from "@fludge/utils/pagination";

export class NativeSaleRepository implements SaleRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findAll(
    organizationId: string,
    cursor: Cursor
  ): Promise<PaginatedResponse<SaleDetail>> {
    const rows = await this.db
      .select({
        ...getColumns(localSale),
        items: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(localSaleItem)}
            ) FILTER (WHERE ${localSaleItem.saleId} IS NOT NULL)
          `.as("items"),
      })
      .from(localSale)
      .innerJoin(localSaleItem, eq(localSaleItem.saleId, localSale.id))
      .where(eq(localSale.organizationId, organizationId))
      .groupBy(localSale.id)
      .orderBy(desc(localSale.createdAt))
      .limit(cursor.limit + 1)
      .offset(cursor.limit * cursor.page);

    return paginate(
      rows.map((sale) => ({
        ...sale,
        items: (JSON.parse(sale.items) as LocalSaleItemSelect[]).map(
          (item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          })
        ),
      })),
      cursor
    );
  }

  public async save(saleValues: SaleDetail | SaleDetail[]): Promise<void> {
    const salesArray = Array.isArray(saleValues) ? saleValues : [saleValues];

    const sales: LocalSaleSelect[] = [];
    const items: LocalSaleItemSelect[] = [];

    for (const sale of salesArray) {
      const { items: saleItems, ...saleValues } = sale;

      sales.push(saleValues);
      items.push(...saleItems);
    }

    await this.db.transaction((tx) => {
      if (sales.length > 0) {
        tx.insert(localSale)
          .values(sales)
          .onConflictDoUpdate({
            target: localSale.id,
            set: buildConflictUpdateColumn(localSale, [
              "saleNumber",
              "paymentType",
              "customerId",
              "completedAt",
              "cancelledAt",
              "total",
              "cancelReason",
              "notes",
              "status",
              "organizationId",
              "createdBy",
              "updatedAt",
            ]),
          })
          .run();
      }

      if (items.length > 0) {
        tx.insert(localSaleItem)
          .values(items)
          .onConflictDoUpdate({
            target: localSaleItem.id,
            set: buildConflictUpdateColumn(localSaleItem, [
              "name",
              "unitPrice",
              "quantity",
              "subtotal",
            ]),
          })
          .run();
      }
    });
  }
}
