import type { DbConnection } from "@fludge/db";
import {
  organization,
  type OrganizationInsert,
} from "@fludge/db/schemas/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";

export class PGOrganizationCommandsRepository {
  constructor(private readonly db: DbConnection) {}

  public async save(values: OrganizationInsert) {
    const [data, error] = await tryCatch(
      this.db
        .insert(organization)
        .values(values)
        .onConflictDoUpdate({
          target: organization.id,
          set: {
            name: values.name,
            phone: values.phone,
            legalName: values.legalName,
            taxId: values.taxId,
            address: values.address,
            status: values.status,
          },
        })
        .returning({
          id: organization.id,
          slug: organization.slug,
        })
        .execute(),
    );

    if (error) return err(error);

    const created = data.at(0);

    if (!created) return err(new Error("Error creando organización"));

    return ok(created);
  }
}
