import { Sale } from "@core/commerce/sale/domain/entities/sale.entity";
import type {
  Options,
  SaleRepository,
} from "@core/commerce/sale/domain/repositories/sale.repository";
import { TransactionalRepository } from "@core/shared/repositories/transactional-repository";
import type { DatabaseService } from "@fludge/db";
import {
  sale,
  saleItem,
  salePayment,
  type SaleItemSelect,
  type SalePaymentSelect,
} from "@fludge/db/schema/sales.schema";
import { jsonObject } from "@fludge/db/utils/build-queries";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, getColumns, inArray, sql } from "drizzle-orm";

export class SQLiteSaleRepository
  extends TransactionalRepository
  implements SaleRepository
{
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  private parseSaleRows<
    T extends {
      items: string;
      payments: string;
      [key: string]: unknown;
    },
  >(rows: T[]) {
    return rows.map((row) => {
      const items = (JSON.parse(row.items) as SaleItemSelect[]).map((i) => ({
        ...i,
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt),
      }));

      const payments = (JSON.parse(row.payments) as SalePaymentSelect[]).map(
        (p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }),
      );

      return Sale.reconstitute({ ...row, items, payments });
    });
  }

  private async find(
    organizationId: string,
    filter: { id?: string; ids?: string[] },
  ) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          ...getColumns(sale),
          items: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(saleItem)}
            ) FILTER (WHERE ${saleItem.saleId} IS NOT NULL)
          `.as("items"),
          payments: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(salePayment)}
            ) FILTER (WHERE ${salePayment.saleId} IS NOT NULL)
          `.as("payments"),
        })
        .from(sale)
        .leftJoin(saleItem, eq(saleItem.saleId, sale.id))
        .leftJoin(salePayment, eq(salePayment.saleId, sale.id))
        .where(
          and(
            eq(sale.organizationId, organizationId),
            filter.id ? eq(sale.id, filter.id) : undefined,
            filter.ids ? inArray(sale.id, filter.ids) : undefined,
          ),
        )
        .groupBy(sale.id),
    );

    if (errFind) return err(errFind);

    return ok(this.parseSaleRows(rows));
  }

  public async findById(organizationId: string, saleId: string) {
    const [sales, errFind] = await this.find(organizationId, { id: saleId });

    if (errFind) return err(errFind);

    return ok(sales.at(0) ?? null);
  }

  public async findByIds(organizationId: string, saleIds: string[]) {
    return this.find(organizationId, { ids: saleIds });
  }

  public async findOpenByCustomer(
    organizationId: string,
    customerId: string,
  ) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          ...getColumns(sale),
          items: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(saleItem)}
            ) FILTER (WHERE ${saleItem.saleId} IS NOT NULL)
          `.as("items"),
          payments: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(salePayment)}
            ) FILTER (WHERE ${salePayment.saleId} IS NOT NULL)
          `.as("payments"),
        })
        .from(sale)
        .leftJoin(saleItem, eq(saleItem.saleId, sale.id))
        .leftJoin(salePayment, eq(salePayment.saleId, sale.id))
        .where(
          and(
            eq(sale.organizationId, organizationId),
            eq(sale.customerId, customerId),
            inArray(sale.status, ["open", "partial"]),
          ),
        )
        .orderBy(sale.createdAt)
        .groupBy(sale.id),
    );

    if (errFind) return err(errFind);

    return ok(this.parseSaleRows(rows));
  }

  public async insert(saleEntity: Sale, options?: Options) {
    const db = options?.tx ?? this.db;

    const { items: _items, payments: _payments, ...rest } = saleEntity.values;

    const [, errInsert] = await tryCatch(
      db.insert(sale).values(rest).onConflictDoNothing(),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async update(saleEntity: Sale, options?: Options) {
    const db = options?.tx ?? this.db;

    const { items: _items, payments: _payments, ...rest } = saleEntity.values;

    const [, errUpdate] = await tryCatch(
      db
        .update(sale)
        .set({
          customerId: rest.customerId,
          total: rest.total,
          totalPaid: rest.totalPaid,
          notes: rest.notes,
          status: rest.status,
          cancelReason: rest.cancelReason,
          cancelledAt: rest.cancelledAt,
          completedAt: rest.completedAt,
          updatedAt: rest.updatedAt,
        })
        .where(
          and(
            eq(sale.id, rest.id),
            eq(sale.organizationId, rest.organizationId),
          ),
        ),
    );

    if (errUpdate) return err(errUpdate);

    return ok(undefined);
  }

  public async updateMany(sales: Sale[], options?: Options) {
    const db = options?.tx ?? this.db;

    for (const saleEntity of sales) {
      const { items: _items, payments: _payments, ...rest } =
        saleEntity.values;

      const [, errUpdate] = await tryCatch(
        db
          .update(sale)
          .set({
            customerId: rest.customerId,
            total: rest.total,
            totalPaid: rest.totalPaid,
            notes: rest.notes,
            status: rest.status,
            cancelReason: rest.cancelReason,
            cancelledAt: rest.cancelledAt,
            completedAt: rest.completedAt,
            updatedAt: rest.updatedAt,
          })
          .where(
            and(
              eq(sale.id, rest.id),
              eq(sale.organizationId, rest.organizationId),
            ),
          ),
      );

      if (errUpdate) return err(errUpdate);
    }

    return ok(undefined);
  }
}
