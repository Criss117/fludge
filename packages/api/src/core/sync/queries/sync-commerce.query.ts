import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { ServerSyncCommerceRepository } from "@fludge/sync/repositories/commerse/server-sync-commerce.repository";
import { tryCatch } from "@fludge/utils/trycatch";
import { cursorSchema } from "@fludge/utils/validators/shared";
import { z } from "zod";

export const syncCommerceQuery = z.object({
  customer: cursorSchema,
  sale: cursorSchema,
});

type Query = z.infer<typeof syncCommerceQuery>;

export class SyncCommerceQuery {
  constructor(
    private readonly syncSaleRepository: ServerSyncCommerceRepository,
  ) {}

  public async execute(organizationIds: string[], lastSyncedAt: Query) {
    const [values, error] = await tryCatch(
      this.syncSaleRepository.findAllItems(organizationIds, lastSyncedAt),
    );

    if (error) throw new InternalServerError(error);

    return values;
  }
}
