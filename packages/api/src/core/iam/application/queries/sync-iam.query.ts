import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { ServerSyncIamRepository } from "@fludge/sync/repositories/iam/server-sync-iam.repository";
import { tryCatch } from "@fludge/utils/trycatch";
import { z } from "zod";

export const syncIamQuery = z.object({
  organization: z.coerce.date().nullable().default(new Date()),
  user: z.coerce.date().nullable(),
  member: z.coerce.date().nullable(),
  group: z.coerce.date().nullable(),
});

type Query = z.infer<typeof syncIamQuery>;

export class SyncIamQuery {
  constructor(private readonly syncIamRepository: ServerSyncIamRepository) {}

  public async execute(organizationIds: string[], lastSyncedAt: Query) {
    const [values, error] = await tryCatch(
      this.syncIamRepository.findAllByUpdatedAt(organizationIds, lastSyncedAt),
    );

    if (error) throw new InternalServerError(error);

    return values;
  }
}
