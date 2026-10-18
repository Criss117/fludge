import { type Aggregate, app, type SyncState } from "@fludge/db/local-schemas/app.schema";
import { type RepositoryError, toRepositoryError } from "@fludge/utils/errors/repository.error";
import { type Result, tryCatch } from "@fludge/utils/trycatch";

import type { DatabaseService, TransactionService } from "..";

export class NativeSyncStateRepository {
  constructor(private readonly db: DatabaseService) {}

  public async find(
    aggregate: Aggregate,
  ): Promise<Result<SyncState[Aggregate] | null, RepositoryError>> {
    return tryCatch(
      () => {
        const row = this.db.select().from(app).all();

        const lastSynced = row.at(0) ?? null;

        return lastSynced?.syncState[aggregate] ?? null;
      },
      {
        parseError: (raw) =>
          toRepositoryError("api_errors.sync.iam.isr_on_find_last_synced_at", raw),
      },
    );
  }

  public save(
    aggregate: Aggregate,
    cursor: {
      updatedAt: Date;
      id: string;
    } | null,
    tx: TransactionService,
  ): Result<void, RepositoryError> {
    return tryCatch(
      () => {
        const row = tx.select().from(app).all();

        tx.update(app)
          .set({
            syncState: {
              ...row[0].syncState,
              [aggregate]: {
                cursor,
                lastSyncedAt: new Date(),
              },
            },
          })
          .run();
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.shared.internal_server_error", raw),
      },
    );
  }
}
