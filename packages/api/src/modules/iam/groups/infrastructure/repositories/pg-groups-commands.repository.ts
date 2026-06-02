import type { DbConnection } from "@fludge/db";
import { group, type GroupInsert } from "@fludge/db/schemas/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

export class PGGroupsCommandsRepository {
  constructor(private readonly db: DbConnection) {}

  public async save(values: GroupInsert) {
    const [data, error] = await tryCatch(
      this.db
        .insert(group)
        .values(values)
        .onConflictDoUpdate({
          target: group.id,
          set: {
            name: values.name,
            slug: values.slug,
            permissions: values.permissions,
          },
        })
        .returning({
          id: group.id,
          slug: group.slug,
          organizationId: group.organizationId,
        })
        .execute(),
    );

    if (error) return err(error);

    const created = data.at(0);

    if (!created) return err(new Error("Error creando grupo"));

    return ok(created);
  }
}
