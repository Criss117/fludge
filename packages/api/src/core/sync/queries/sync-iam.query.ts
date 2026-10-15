import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { ServerSyncIamRepository } from "@fludge/sync/repositories/iam/server-sync-iam.repository";
import { tryCatch } from "@fludge/utils/trycatch";
import { cursorSchema } from "@fludge/utils/validators/shared";
import { z } from "zod";

export const syncIamQuery = z.object({
  organization: cursorSchema,
  member: cursorSchema,
  group: cursorSchema,
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
