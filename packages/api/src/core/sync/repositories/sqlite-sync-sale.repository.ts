import type { DatabaseService } from "@fludge/db";
import {
  customer,
  customerPayment,
  type CustomerPaymentSelect,
} from "@fludge/db/schema/customer.schema";
import {
  sale,
  saleItem,
  salePayment,
  type SaleItemSelect,
  type SalePaymentSelect,
} from "@fludge/db/schema/sales.schema";
import { jsonObject } from "@fludge/db/utils/build-queries";
import type { ServerSyncCommerceRepository } from "@fludge/sync/repositories/commerse/server-sync-commerce.repository";
import type {
  CommerceLastSyncedAt,
  CommerceSyncResult,
} from "@fludge/sync/types/commerce.types";

import { and, desc, eq, getColumns, gt, inArray, sql } from "drizzle-orm";

export class SqliteSyncCommerceRepository implements ServerSyncCommerceRepository {
  constructor(private readonly db: DatabaseService) {}

  private async findCustomers(
    organizationIds: string[],
    lastSyncedAt: CommerceLastSyncedAt["customer"],
  ) {
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
      .where(
        and(
          inArray(customer.organizationId, organizationIds),
          lastSyncedAt ? gt(customer.updatedAt, lastSyncedAt) : undefined,
        ),
      )
      .orderBy(desc(customer.updatedAt))
      .groupBy(customer.id);

    return rows
      .map((p) => {
        const payments = (
          JSON.parse(p.payments) as CustomerPaymentSelect[]
        ).map((p) => ({
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
  }

  private async findSales(
    organizationIds: string[],
    lastSyncedAt: CommerceLastSyncedAt["sale"],
  ) {
    const rows = await this.db
      .select({
        ...getColumns(sale),
        payments: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(salePayment)}
            ) FILTER (WHERE ${salePayment.id} IS NOT NULL)
          `.as("payments"),

        items: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(saleItem)}
            ) FILTER (WHERE ${saleItem.id} IS NOT NULL)
          `.as("payments"),
      })
      .from(sale)
      .leftJoin(salePayment, eq(salePayment.saleId, sale.id))
      .leftJoin(saleItem, eq(saleItem.saleId, sale.id))
      .where(
        and(
          inArray(sale.organizationId, organizationIds),
          lastSyncedAt ? gt(sale.updatedAt, lastSyncedAt) : undefined,
        ),
      )
      .orderBy(desc(sale.updatedAt))
      .groupBy(sale.id);

    return rows
      .map((p) => {
        const payments = (JSON.parse(p.payments) as SalePaymentSelect[]).map(
          (p) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }),
        );

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
      })
      .filter((p) => p.id !== null);
  }

  public async findAllItems(
    organizationIds: string[],
    lastSyncedAt: CommerceLastSyncedAt,
  ): Promise<CommerceSyncResult> {
    const [customers, sales] = await Promise.all([
      this.findCustomers(organizationIds, lastSyncedAt.customer),
      this.findSales(organizationIds, lastSyncedAt.sale),
    ]);

    return {
      customers,
      sales,
    };
  }
}
