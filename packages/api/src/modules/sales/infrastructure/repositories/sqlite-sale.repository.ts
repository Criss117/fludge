import { TransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";
import type { DatabaseService, TransactionService } from "@fludge/db";
import {
  sale,
  saleItem,
  type SaleItemSelect,
} from "@fludge/db/schema/sales.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, getColumns, sql } from "drizzle-orm";
import { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";
import type { SaleItemRepository } from "@fludge/api/modules/sales/domain/repositories/sale-item.repository";
import { jsonObject } from "@fludge/db/utils/build-queries";
import type { SaleRepository } from "@fludge/api/modules/sales/domain/repositories/sale.repository";

type Options = {
  tx?: TransactionService;
};

export class SQLiteSaleRepository extends TransactionalRepository implements SaleRepository {
  constructor(
    private readonly db: DatabaseService,
    private readonly saleItemRepository: SaleItemRepository,
  ) {
    super(db);
  }

  public async findById(organizationId: string, saleId: string) {
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
        .where(
          and(eq(sale.id, saleId), eq(sale.organizationId, organizationId)),
        )
        .limit(1)
        .groupBy(sale.id),
    );

    if (error) return err(error);

    const data = rows.at(0);

    if (!data) return ok(null);

    const items = (JSON.parse(data.items) as SaleItemSelect[]).map((i) => ({
      ...i,
      createdAt: new Date(i.createdAt),
      updatedAt: new Date(i.updatedAt),
    }));

    return ok(Sale.reconstitute({ ...data, items }));
  }

  public async saveOnlySale(saleEntity: Sale, options?: Options) {
    const db = options?.tx ?? this.db;

    const values = saleEntity.values;

    return tryCatch(
      db
        .insert(sale)
        .values({
          id: values.id,
          organizationId: values.organizationId,
          customerId: values.customerId,
          saleNumber: values.saleNumber,
          paymentType: values.paymentType,
          total: values.total,
          notes: values.notes,
          status: values.status,
          createdBy: values.createdBy,
          createdAt: values.createdAt,
          updatedAt: values.updatedAt,
        })
        .onConflictDoUpdate({
          target: sale.id,
          set: {
            customerId: values.customerId,
            saleNumber: values.saleNumber,
            paymentType: values.paymentType,
            total: values.total,
            notes: values.notes,
            status: values.status,
            updatedAt: values.updatedAt,
          },
        }),
    );
  }

  private async saveContent(saleEntity: Sale, options: Options) {
    const [, errInsertSale] = await this.saveOnlySale(saleEntity, {
      tx: options.tx,
    });

    if (errInsertSale) throw errInsertSale;

    const [, errInsertItems] = await this.saleItemRepository.save(saleEntity, {
      tx: options.tx,
    });

    if (errInsertItems) throw errInsertItems;
  }

  public async save(saleEntity: Sale, options?: Options) {
    if (options?.tx) {
      return tryCatch(this.saveContent(saleEntity, options));
    }

    const transaction = this.db.transaction(async (tx) => {
      await this.saveContent(saleEntity, { tx });
    });

    return tryCatch(transaction);
  }
}
