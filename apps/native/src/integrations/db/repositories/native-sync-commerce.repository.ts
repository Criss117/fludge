import { DatabaseService } from "..";
import { desc, inArray } from "drizzle-orm";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { ClientSyncCommerceRepository } from "@fludge/sync/repositories/commerse/client-sync-commerce.repository";
import type {
  CommerceLastSyncedAt,
  CommerceSyncResult,
} from "@fludge/sync/types/commerce.types";
import {
  localCustomer,
  localCustomerPayment,
  localSale,
  localSaleItem,
  localSalePayment,
} from "@fludge/db/local-schemas/shared.schema";

export class NativeSyncCommerceRepository implements ClientSyncCommerceRepository {
  constructor(private readonly db: DatabaseService) {}

  private async getLastSyncedCustomerDate(): Promise<Date | null> {
    const row = await this.db
      .select({ updatedAt: localCustomer.updatedAt })
      .from(localCustomer)
      .orderBy(desc(localCustomer.updatedAt))
      .limit(1);

    return row.at(0)?.updatedAt ?? null;
  }

  private async getLastSyncedSaleDate(): Promise<Date | null> {
    const row = await this.db
      .select({ updatedAt: localSale.updatedAt })
      .from(localSale)
      .orderBy(desc(localSale.updatedAt))
      .limit(1);

    return row.at(0)?.updatedAt ?? null;
  }

  public async getLastSyncedAt(): Promise<CommerceLastSyncedAt> {
    const [customer, sale] = await Promise.all([
      this.getLastSyncedCustomerDate(),
      this.getLastSyncedSaleDate(),
    ]);

    return { customer, sale };
  }

  public async saveAll(values: CommerceSyncResult): Promise<void> {
    this.db.transaction((tx) => {
      if (values.customers.length > 0) {
        tx.delete(localCustomerPayment)
          .where(
            inArray(
              localCustomerPayment.customerId,
              values.customers.map((c) => c.id),
            ),
          )
          .run();

        tx.insert(localCustomer)
          .values(values.customers)
          .onConflictDoUpdate({
            target: localCustomer.id,
            set: buildConflictUpdateColumn(localCustomer, [
              "name",
              "phone",
              "email",
              "creditLimit",
              "balance",
              "documentType",
              "documentNumber",
              "status",
              "updatedAt",
            ]),
          })
          .run();

        const payments = values.customers.flatMap((c) => c.payments);

        if (payments.length > 0) {
          tx.insert(localCustomerPayment)
            .values(values.customers.flatMap((c) => c.payments))
            .run();
        }
      }

      if (values.sales.length > 0) {
        tx.delete(localSalePayment)
          .where(
            inArray(
              localSalePayment.saleId,
              values.sales.map((s) => s.id),
            ),
          )
          .run();

        tx.delete(localSaleItem)
          .where(
            inArray(
              localSaleItem.saleId,
              values.sales.map((s) => s.id),
            ),
          )
          .run();

        tx.insert(localSale)
          .values(values.sales)
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
              "totalPaid",
              "cancelReason",
              "updatedAt",
            ]),
          })
          .run();

        const payments = values.sales.flatMap((s) => s.payments);
        const items = values.sales.flatMap((s) => s.items);

        if (payments.length > 0) {
          tx.insert(localSalePayment)
            .values(values.sales.flatMap((s) => s.payments))
            .run();
        }

        if (items.length > 0) {
          tx.insert(localSaleItem)
            .values(values.sales.flatMap((s) => s.items))
            .run();
        }
      }
    });
  }
}
