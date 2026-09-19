import type { DatabaseService } from "@fludge/db";
import { customer } from "@fludge/db/schema/customer.schema";
import type { ServerSyncCustomerRepository } from "@fludge/sync/repositories/customer/server-sync-customer.repository";
import type {
  CustomerLastSyncedAtQuery,
  CustomerSyncAllItems,
} from "@fludge/sync/types/customer.types";
import { and, gt, inArray } from "drizzle-orm";

export class SyncCustomerRepository implements ServerSyncCustomerRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findAllCustomers(
    organizationIds: string[],
    lastSyncedAt: CustomerLastSyncedAtQuery["customer"],
  ) {
    return this.db
      .select()
      .from(customer)
      .where(
        and(
          inArray(customer.organizationId, organizationIds),
          lastSyncedAt ? gt(customer.updatedAt, lastSyncedAt) : undefined,
        ),
      )
      .groupBy(customer.id);
  }

  public async findAllItems(
    organizationIds: string[],
    lastSyncedAt: CustomerLastSyncedAtQuery,
  ): Promise<CustomerSyncAllItems> {
    const customers = await this.findAllCustomers(
      organizationIds,
      lastSyncedAt.customer,
    );

    return {
      customers,
    };
  }
}