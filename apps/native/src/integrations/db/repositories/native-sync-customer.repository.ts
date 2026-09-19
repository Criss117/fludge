import { DatabaseService } from "..";
import { desc } from "drizzle-orm";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import type { ClientSyncCustomerRepository } from "@fludge/sync/repositories/customer/client-sync-customer.repository";
import { localCustomer } from "@fludge/db/local-schemas/shared.schema";
import type {
  CustomerLastSyncedAtLocal,
  CustomerSyncAllItems,
} from "@fludge/sync/types/customer.types";

export class NativeSyncCustomerRepository implements ClientSyncCustomerRepository {
  constructor(private readonly db: DatabaseService) {}

  private async getLastSyncedCustomer() {
    const row = await this.db
      .select()
      .from(localCustomer)
      .orderBy(desc(localCustomer.updatedAt))
      .limit(1);

    return row.at(0) ?? null;
  }

  public async getLastSyncedAt(): Promise<CustomerLastSyncedAtLocal> {
    const customer = await this.getLastSyncedCustomer();

    return {
      customer,
    };
  }

  public async saveAll(values: CustomerSyncAllItems): Promise<void> {
    this.db.transaction((tx) => {
      if (values.customers.length > 0) {
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
      }
    });
  }
}
