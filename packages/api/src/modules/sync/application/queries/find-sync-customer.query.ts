import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { DatabaseService } from "@fludge/db";
import { member, organization } from "@fludge/db/schema/iam.schema";
import type { SyncServerCustomerEngine } from "@fludge/sync/engine/customer/sync-server-customer.engine";
import { tryCatch } from "@fludge/utils/trycatch";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const findSyncCustomerQuery = z.object({
  customer: z.coerce.date<Date>().nullable().default(null),
});

type Query = z.infer<typeof findSyncCustomerQuery>;

export class FindSyncCustomerQuery {
  constructor(
    public readonly db: DatabaseService,
    public readonly syncServerCustomerEngine: SyncServerCustomerEngine,
  ) {}

  public async execute(loggedUserId: string, lastSyncedAt: Query) {
    const [organizations, errorFind] = await tryCatch(
      this.db
        .select({
          id: organization.id,
        })
        .from(organization)
        .where(
          inArray(
            organization.id,
            this.db
              .select({
                id: member.organizationId,
              })
              .from(member)
              .where(eq(member.userId, loggedUserId)),
          ),
        ),
    );

    if (errorFind)
      throw new InternalServerError(
        errorFind,
        "api_errors.sync.iam.isr_on_find_organizations",
      );

    const [values, errorFindSync] = await tryCatch(
      this.syncServerCustomerEngine.getLastSyncedAt(
        organizations.map((o) => o.id),
        lastSyncedAt,
      ),
    );

    if (errorFindSync)
      throw new InternalServerError(
        errorFindSync,
        "api_errors.sync.iam.isr_on_find_last_synced_at",
      );

    return values;
  }
}