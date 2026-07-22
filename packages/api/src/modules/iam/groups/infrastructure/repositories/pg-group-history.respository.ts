import {
  TransactionalRepository,
  type TransactionalOptions,
} from "@fludge/api/modules/shared/repositories/transactional-repository";
import type { DBConnection } from "@fludge/db";
import {
  groupHistory,
  type GroupHistoryInsert,
} from "@fludge/db/schemas/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

export class PGGroupHistoryRepository extends TransactionalRepository {
  constructor(private readonly db: DBConnection) {
    super(db);
  }

  public async save(
    values: GroupHistoryInsert,
    options?: TransactionalOptions,
  ) {
    const db = options?.tx ?? this.db;

    const [data, error] = await tryCatch(
      db
        .insert(groupHistory)
        .values(values)
        .onConflictDoUpdate({
          target: groupHistory.id,
          set: {
            action: values.action,
            description: values.description,
            before: values.before,
            after: values.after,
            createdBy: values.createdBy,
          },
        })
        .returning({
          id: groupHistory.id,
        })
        .execute(),
    );

    if (error) return err(error);

    const created = data.at(0);

    if (!created) return err(new Error("Error creando historial de grupo"));

    return ok(created);
  }
}
