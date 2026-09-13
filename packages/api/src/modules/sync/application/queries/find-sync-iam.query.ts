import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { DatabaseService } from "@fludge/db";
import { member, organization } from "@fludge/db/schema/iam.schema";
import type { SyncServerIamEngine } from "@fludge/sync/engine/iam/sync-server-iam.engine";
import { tryCatch } from "@fludge/utils/trycatch";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const findSyncIamQuery = z.object({
  user: z.coerce.date<Date>().nullable().default(null),
  group: z.coerce.date<Date>().nullable().default(null),
  member: z.coerce.date<Date>().nullable().default(null),
  organization: z.coerce.date<Date>().nullable().default(null),
});

type Query = z.infer<typeof findSyncIamQuery>;

export class FindSyncIamQuery {
  constructor(
    public readonly db: DatabaseService,
    public readonly syncIamEngine: SyncServerIamEngine,
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
      this.syncIamEngine.getLastSyncedAt(
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
