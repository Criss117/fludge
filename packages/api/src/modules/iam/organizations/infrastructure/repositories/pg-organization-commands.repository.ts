import type { DbConnection } from "@fludge/db";
import {
  organizationHistory,
  type OrganizationHistoryInsert,
} from "@fludge/db/schemas/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { organization } from "@fludge/db/schemas/auth.schema";
import { eq } from "drizzle-orm";
import { TransactionalRepository } from "@fludge/api/modules/shared/repositories/transactional-repository";

export class PGOrganizationCommandsRepository extends TransactionalRepository {
  constructor(private readonly db: DbConnection) {
    super(db);
  }

  public async findOne(organizationId: string) {
    const [data, error] = await tryCatch(
      this.db
        .select()
        .from(organization)
        .where(eq(organization.id, organizationId))
        .execute(),
    );

    if (error) return err(error);

    const org = data.at(0);

    if (!org) return err(new Error("No se encontró la organización"));

    return ok(org);
  }

  public async saveHistory(values: OrganizationHistoryInsert) {
    const [, error] = await tryCatch(
      this.db.insert(organizationHistory).values(values).execute(),
    );

    if (error) return err(error);

    return ok(null);
  }
}
