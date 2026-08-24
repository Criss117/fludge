import {
  buildConflictUpdateColumn,
  type DatabaseService,
  type TransactionService,
} from "@fludge/db";
import type { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { err, ok, tryCatch, type Result } from "@fludge/utils/trycatch";
import { group } from "@fludge/db/schema/iam.schema";

type Options = { tx?: TransactionService };

export class PgGroupRepository {
  constructor(private readonly db: DatabaseService) {}

  public async save(
    organizationId: string,
    groupValues: Group | Group[],
    options?: Options,
  ): Promise<Result<undefined, Error>> {
    const db = options?.tx ?? this.db;

    const groups = Array.isArray(groupValues) ? groupValues : [groupValues];

    const [, errInsert] = await tryCatch(
      db
        .insert(group)
        .values(
          groups.map((g) => ({
            organizationId: organizationId,
            ...g.values,
          })),
        )
        .onConflictDoUpdate({
          target: group.id,
          set: buildConflictUpdateColumn(group, [
            "name",
            "slug",
            "description",
            "permissions",
            "updatedAt",
          ]),
        }),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }
}
