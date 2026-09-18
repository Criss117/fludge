import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { DatabaseService } from "@fludge/db";
import { member, organization } from "@fludge/db/schema/iam.schema";
import type { SyncServerCatalogEngine } from "@fludge/sync/engine/catalog/sync-server-catalog.engine";
import { tryCatch } from "@fludge/utils/trycatch";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const findSyncCatalogQuery = z.object({
  product: z.coerce.date<Date>().nullable().default(null),
  category: z.coerce.date<Date>().nullable().default(null),
  productPresentation: z.coerce.date<Date>().nullable().default(null),
});

type Query = z.infer<typeof findSyncCatalogQuery>;

export class FindSyncCatalogQuery {
  constructor(
    public readonly db: DatabaseService,
    public readonly syncServerCatalogEngine: SyncServerCatalogEngine,
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
      this.syncServerCatalogEngine.getLastSyncedAt(
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
