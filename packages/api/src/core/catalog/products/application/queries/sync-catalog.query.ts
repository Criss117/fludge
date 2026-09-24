import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { ServerSyncCatalogRepository } from "@fludge/sync/repositories/catalog/server-sync-catalog.repository";
import { tryCatch } from "@fludge/utils/trycatch";
import { z } from "zod";

export const syncCatalogQuery = z.object({
  product: z.coerce.date<Date>().nullable(),
  category: z.coerce.date<Date>().nullable(),
});

type Query = z.infer<typeof syncCatalogQuery>;

export class SyncCatalogQuery {
  constructor(
    private readonly syncCatalogRepository: ServerSyncCatalogRepository,
  ) {}

  public async execute(organizationIds: string[], lastSyncedAt: Query) {
    const [values, error] = await tryCatch(
      this.syncCatalogRepository.findAllItems(organizationIds, lastSyncedAt),
    );

    if (error) throw new InternalServerError(error);

    return values;
  }
}
