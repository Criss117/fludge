import { Organization } from "../../../iam/domain/entities/organization.entity";
import type {
  Options,
  OrganizationRepository,
} from "../../../iam/domain/repositories/organization.repository";
import { TransactionalRepository } from "../../../shared/repositories/transactional-repository";
import type { DatabaseService } from "@fludge/db";
import { organization } from "@fludge/db/schema/iam.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { eq } from "drizzle-orm";

export class SQLiteOrganizationRepository
  extends TransactionalRepository
  implements OrganizationRepository
{
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  public async findById(organizationId: string) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select()
        .from(organization)
        .where(eq(organization.id, organizationId)),
    );

    if (errFind) return err(errFind);

    const org = rows.at(0);

    if (!org) return ok(null);

    return ok(Organization.reconstitute(org));
  }

  public async insert(org: Organization, options?: Options) {
    const db = options?.tx ?? this.db;

    const [, errInsert] = await tryCatch(
      db.insert(organization).values(org.values).onConflictDoNothing(),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async update(org: Organization) {
    const [, errUpdate] = await tryCatch(
      this.db
        .update(organization)
        .set(org.values)
        .where(eq(organization.id, org.values.id)),
    );

    if (errUpdate) return err(errUpdate);

    return ok(undefined);
  }
}