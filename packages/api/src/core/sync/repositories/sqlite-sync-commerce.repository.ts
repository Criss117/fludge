import type { DatabaseService } from "@fludge/db";
import type { LocalCustomer, LocalSale } from "@fludge/db/local-schemas/shared.schema";
import {
  customer,
  customerPayment,
  type CustomerPaymentSelect,
} from "@fludge/db/schema/customer.schema";
import {
  sale,
  saleItem,
  type SaleItemSelect,
  salePayment,
  type SalePaymentSelect,
} from "@fludge/db/schema/sales.schema";
import { jsonObject } from "@fludge/db/utils/build-queries";
import type { ServerSyncCommerceRepository } from "@fludge/sync/repositories/commerse/server-sync-commerce.repository";
import type { CommerceSyncCursors, CommerceSyncResult } from "@fludge/sync/types/commerce.types";
import {
  paginateSync,
  type PaginateSyncQueryFn,
  type SyncCursor,
} from "@fludge/sync/types/shared.types";
import { and, asc, eq, getColumns, gt, inArray, or, sql } from "drizzle-orm";

const after = <T extends { updatedAt: any; id: any }>(t: T, c: SyncCursor | null) =>
  c
    ? or(gt(t.updatedAt, c.updatedAt), and(eq(t.updatedAt, c.updatedAt), gt(t.id, c.id)))
    : undefined;

export class SqliteSyncCommerceRepository implements ServerSyncCommerceRepository {
  constructor(private readonly db: DatabaseService) {}

  private findCustomers(organizationIds: string[]): PaginateSyncQueryFn<LocalCustomer> {
    return async (cursor, limit) => {
      const rows = await this.db
        .select({
          ...getColumns(customer),
          payments: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(customerPayment)}
            ) FILTER (WHERE ${customerPayment.customerId} IS NOT NULL)
          `.as("payments"),
        })
        .from(customer)
        .leftJoin(customerPayment, eq(customerPayment.customerId, customer.id))
        .where(and(inArray(customer.organizationId, organizationIds), after(customer, cursor)))
        .limit(limit)
        .orderBy(asc(customer.updatedAt), asc(customer.id))
        .groupBy(customer.id);

      return rows
        .map((p) => {
          const payments = (JSON.parse(p.payments) as CustomerPaymentSelect[]).map((p) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));

          return {
            ...p,
            payments,
          };
        })
        .filter((p) => p.id !== null);
    };
  }

  private findSales(organizationIds: string[]): PaginateSyncQueryFn<LocalSale> {
    return async (cursor, limit) => {
      const rows = await this.db
        .select({
          ...getColumns(sale),
          payments: sql<string>`(
          SELECT json_group_array(${jsonObject(salePayment)})
          FROM ${salePayment}
          WHERE ${salePayment.saleId} = ${sale.id}
        )`.as("payments"),
          items: sql<string>`(
          SELECT json_group_array(${jsonObject(saleItem)})
          FROM ${saleItem}
          WHERE ${saleItem.saleId} = ${sale.id}
        )`.as("items"),
        })
        .from(sale)
        .where(and(inArray(sale.organizationId, organizationIds), after(sale, cursor)))
        .limit(limit)
        .orderBy(asc(sale.updatedAt), asc(sale.id))
        .groupBy(sale.id);

      return rows.map((p) => {
        const payments = (JSON.parse(p.payments) as SalePaymentSelect[]).map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));

        const items = (JSON.parse(p.items) as SaleItemSelect[]).map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));

        return {
          ...p,
          payments,
          items,
        };
      });
    };
  }

  public async findAllItems(
    organizationIds: string[],
    lastSyncedAt: CommerceSyncCursors,
    limit = 500,
  ): Promise<CommerceSyncResult> {
    const [customers, sales] = await Promise.all([
      paginateSync(this.findCustomers(organizationIds), lastSyncedAt.customer, limit),
      paginateSync(this.findSales(organizationIds), lastSyncedAt.sale, limit),
    ]);

    return {
      customers,
      sales,
    };
  }
}
