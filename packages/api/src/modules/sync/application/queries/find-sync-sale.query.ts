import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { DatabaseService } from "@fludge/db";
import { member, organization } from "@fludge/db/schema/iam.schema";
import type { SyncServerSaleEngine } from "@fludge/sync/engine/sale/sync-server-sale.engine";
import { tryCatch } from "@fludge/utils/trycatch";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const findSyncSaleQuery = z.object({
  sale: z.coerce.date<Date>().nullable().default(null),
  saleItem: z.coerce.date<Date>().nullable().default(null),
});

type Query = z.infer<typeof findSyncSaleQuery>;

export class FindSyncSaleQuery {
  constructor(
    public readonly db: DatabaseService,
    public readonly syncServerSaleEngine: SyncServerSaleEngine,
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
      this.syncServerSaleEngine.getLastSyncedAt(
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
