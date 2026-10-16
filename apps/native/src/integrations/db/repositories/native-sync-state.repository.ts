import { type Aggregate, app } from "@fludge/db/local-schemas/app.schema";

import type { DatabaseService, TransactionService } from "..";

export class NativeSyncStateRepository {
  constructor(private readonly db: DatabaseService) {}

  public async find(aggregate: Aggregate) {
    const row = this.db.select().from(app).all();

    const lastSynced = row.at(0) ?? null;

    return lastSynced?.syncState[aggregate] ?? null;
  }

  public async save(
    aggregate: Aggregate,
    cursor: {
      updatedAt: Date;
      id: string;
    } | null,
    tx: TransactionService,
  ) {
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
  }
}
