import { type Aggregate, syncState } from "@fludge/db/local-schemas/app.schema";
import { DatabaseService, TransactionService } from "..";
import { eq } from "drizzle-orm";

export class NativeSyncStateRepository {
  constructor(private readonly db: DatabaseService) {}

  public async find(aggregate: Aggregate) {
    const row = this.db
      .select()
      .from(syncState)
      .where(eq(syncState.aggregate, aggregate))
      .all();

    const lastSynced = row.at(0) ?? null;

    if (!lastSynced) {
      this.db
        .insert(syncState)
        .values({
          aggregate: aggregate,
        })
        .run();
    }

    return lastSynced;
  }

  public async save(
    aggregate: Aggregate,
    cursor: {
      updatedAt: Date;
      id: string;
    } | null,
    tx: TransactionService,
  ) {
    tx.insert(syncState)
      .values({
        aggregate,
        lastSyncedAt: new Date(),
        cursor,
      })
      .onConflictDoUpdate({
        target: syncState.aggregate,
        set: {
          lastSyncedAt: new Date(),
          cursor,
        },
      })
      .run();
  }
}
