import {
  type LocalCustomer,
  localCustomer,
  localCustomerPayment,
  type LocalSale,
  localSale,
  localSaleItem,
  localSalePayment,
} from "@fludge/db/local-schemas/shared.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { ClientSyncCommerceRepository } from "@fludge/sync/repositories/commerse/client-sync-commerce.repository";
import type { CommerceSyncCursors, CommerceSyncResult } from "@fludge/sync/types/commerce.types";
import { inArray } from "drizzle-orm";

import type { DatabaseService } from "..";
import type { NativeSyncStateRepository } from "./native-sync-state.repository";

export class NativeSyncCommerceRepository implements ClientSyncCommerceRepository {
  constructor(
    private readonly db: DatabaseService,
    private readonly syncStateRepository: NativeSyncStateRepository,
  ) {}

  public async getLastSyncedAt(): Promise<CommerceSyncCursors> {
    const [customer, sale] = await Promise.all([
      this.syncStateRepository.find("customers"),
      this.syncStateRepository.find("sales"),
    ]);

    return { customer: customer?.cursor ?? null, sale: sale?.cursor ?? null };
  }

  public async saveAll(values: CommerceSyncResult): Promise<void> {
    const { customers, sales } = values;

    this.db.transaction((tx) => {
      if (customers.items.length > 0) {
        const paymentsList: LocalCustomer["payments"] = [];
        const customersList: Omit<LocalCustomer, "payments">[] = [];

        for (const customer of customers.items) {
          const { payments, ...customerValues } = customer;

          paymentsList.push(...payments);
          customersList.push(customerValues);
        }

        tx.delete(localCustomerPayment)
          .where(
            inArray(
              localCustomerPayment.customerId,
              customersList.map((c) => c.id),
            ),
          )
          .run();

        tx.insert(localCustomer)
          .values(customersList)
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

        if (paymentsList.length > 0) {
          tx.insert(localCustomerPayment).values(paymentsList).run();
        }

        this.syncStateRepository.save("customers", customers.nextCursor, tx);
      }

      if (sales.items.length > 0) {
        const paymentsList: LocalSale["payments"] = [];
        const itemsList: LocalSale["items"] = [];
        const salesList: Omit<LocalSale, "payments" | "items">[] = [];

        for (const sale of sales.items) {
          const { payments, items, ...saleValues } = sale;

          paymentsList.push(...payments);
          itemsList.push(...items);
          salesList.push(saleValues);
        }

        tx.delete(localSalePayment)
          .where(
            inArray(
              localSalePayment.saleId,
              salesList.map((s) => s.id),
            ),
          )
          .run();

        tx.delete(localSaleItem)
          .where(
            inArray(
              localSaleItem.saleId,
              salesList.map((s) => s.id),
            ),
          )
          .run();

        tx.insert(localSale)
          .values(salesList)
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

        if (paymentsList.length > 0) {
          tx.insert(localSalePayment).values(paymentsList).run();
        }

        if (itemsList.length > 0) {
          tx.insert(localSaleItem).values(itemsList).run();
        }

        this.syncStateRepository.save("sales", sales.nextCursor, tx);
      }
    });
  }
}
