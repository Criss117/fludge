import type { SaleSummary } from "@fludge/client/commerce/domain/entities";
import type {
  FindAllSalesFilters,
  SaleRepository,
} from "@fludge/client/commerce/domain/sale.repository";
import type { LocalSale } from "@fludge/db/local-schemas/shared.schema";
import {
  localCustomer,
  localSale,
  localSaleItem,
  localSalePayment,
} from "@fludge/db/local-schemas/shared.schema";
import { buildConflictUpdateColumn, jsonObject } from "@fludge/db/utils/build-queries";
import { type Cursor, paginate, type PaginatedResponse } from "@fludge/utils/pagination";
import { and, desc, eq, getColumns, inArray, sql } from "drizzle-orm";

import type { DatabaseService } from "@/integrations/db";

export class NativeSaleRepository implements SaleRepository {
  constructor(private readonly db: DatabaseService) {}

  public async clearAll(): Promise<void> {
    this.db.transaction((tx) => {
      tx.delete(localSalePayment).run();
      tx.delete(localSaleItem).run();
      tx.delete(localSale).run();
    });
  }

  public async findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllSalesFilters,
  ): Promise<PaginatedResponse<SaleSummary>> {
    const rows = this.db
      .select({
        ...getColumns(localSale),
        items: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(localSaleItem)}
            ) FILTER (WHERE ${localSaleItem.saleId} IS NOT NULL)
          `.as("items"),
        payments: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(localSalePayment)}
            ) FILTER (WHERE ${localSalePayment.saleId} IS NOT NULL)
          `.as("payments"),
        customer: getColumns(localCustomer),
      })
      .from(localSale)
      .leftJoin(localSaleItem, eq(localSaleItem.saleId, localSale.id))
      .leftJoin(localSalePayment, eq(localSalePayment.saleId, localSale.id))
      .leftJoin(localCustomer, eq(localCustomer.id, localSale.customerId))
      .where(
        and(
          eq(localSale.organizationId, organizationId),
          filters?.customerId ? eq(localSale.customerId, filters.customerId) : undefined,
        ),
      )
      .groupBy(localSale.id)
      .orderBy(desc(localSale.createdAt))
      .limit(cursor.limit + 1)
      .offset(cursor.limit * cursor.page)
      .all();

    return paginate(
      rows
        .map((sale) => ({
          ...sale,
          items: (JSON.parse(sale.items) as SaleSummary["items"]).map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          })),
          payments: (JSON.parse(sale.payments) as SaleSummary["payments"]).map((payment) => ({
            ...payment,
            createdAt: new Date(payment.createdAt),
            updatedAt: new Date(payment.updatedAt),
          })),
        }))
        .filter((sale) => sale.id !== null),
      cursor,
    );
  }

  public async save(saleValues: LocalSale | LocalSale[]): Promise<void> {
    const salesArray = Array.isArray(saleValues) ? saleValues : [saleValues];

    const sales: Omit<LocalSale, "items" | "payments" | "customer">[] = [];
    const items: LocalSale["items"] = [];
    const payments: LocalSale["payments"] = [];

    for (const sale of salesArray) {
      const { items: saleItems, payments: salePayments, ...saleValues } = sale;

      sales.push(saleValues);
      payments.push(...salePayments);
      items.push(...saleItems);
    }

    this.db.transaction((tx) => {
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
        tx.delete(localSaleItem)
          .where(
            inArray(
              localSaleItem.saleId,
              sales.map((s) => s.id),
            ),
          )
          .run();

        tx.insert(localSaleItem).values(items).run();
      }

      if (payments.length > 0) {
        tx.delete(localSalePayment)
          .where(
            inArray(
              localSalePayment.saleId,
              sales.map((s) => s.id),
            ),
          )
          .run();

        tx.insert(localSalePayment).values(payments).run();
      }
    });
  }
}
